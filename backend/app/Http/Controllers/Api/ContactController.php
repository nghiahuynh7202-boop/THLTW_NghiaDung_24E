<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContactController extends Controller
{
    /**
     * 1. Lấy danh sách liên hệ (có lọc trạng thái và tìm kiếm)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Contact::with('user')->latest('id');

        // Lọc theo trạng thái xử lý: chua_xem, da_xem, da_tra_loi
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Tìm kiếm theo tên, sđt hoặc email
        if ($request->filled('keyword')) {
            $kw = $request->input('keyword');
            $query->where(function ($q) use ($kw) {
                $q->where('name', 'like', "%{$kw}%")
                  ->orWhere('phone', 'like', "%{$kw}%")
                  ->orWhere('email', 'like', "%{$kw}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        return ContactResource::collection($query->paginate($perPage));
    }

    /**
     * 2. Thêm liên hệ mới (Khách gửi form liên hệ)
     */
    public function store(ContactRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($request->user() && empty($data['user_id'])) {
            $data['user_id'] = $request->user()->id;
        }

        $contact = Contact::create($data);

        return (new ContactResource($contact))
            ->additional(['message' => 'Gửi liên hệ thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * 3. Xem chi tiết một liên hệ
     */
    public function show($id): ContactResource
    {
        $contact = Contact::with('user')->findOrFail($id);

        // Khi admin xem chi tiết, nếu trạng thái đang là 'chua_xem' thì tự động đổi sang 'da_xem'
        if ($contact->status === 'chua_xem') {
            $contact->update(['status' => 'da_xem']);
        }

        return new ContactResource($contact);
    }

    /**
     * 4. Xem chi tiết và phản hồi liên hệ
     */
    public function update(ContactRequest $request, $id): JsonResponse
    {
        $contact = $id instanceof Contact ? $id : Contact::findOrFail($id);
        $data = $request->validated();

        // Nếu có phản hồi và chưa có ngày trả lời thì tự lưu thời gian hiện tại
        if (! empty($data['reply']) && empty($contact->replied_at)) {
            $data['replied_at'] = now();
            $data['status'] = $data['status'] ?? 'da_tra_loi';
        }

        $contact->update($data);

        return (new ContactResource($contact))
            ->additional(['message' => 'Lưu phản hồi liên hệ thành công.'])
            ->response();
    }

    /**
     * 5. Xóa liên hệ (chuyển vào thùng rác)
     */
    public function destroy($id): JsonResponse
    {
        $contact = $id instanceof Contact ? $id : Contact::findOrFail($id);
        $contact->delete();

        return response()->json([
            'message' => 'Xóa liên hệ thành công.',
        ]);
    }

    /**
     * 6. Danh sách liên hệ trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 10);
        $contacts = Contact::onlyTrashed()
            ->with('user')
            ->latest('deleted_at')
            ->paginate($perPage);

        return ContactResource::collection($contacts);
    }

    /**
     * 7. Khôi phục liên hệ từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $contact = Contact::onlyTrashed()->findOrFail($id);
        $contact->restore();

        return (new ContactResource($contact))
            ->additional(['message' => 'Khôi phục liên hệ thành công.'])
            ->response();
    }

    /**
     * 8. Xóa vĩnh viễn liên hệ khỏi cơ sở dữ liệu
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $contact = Contact::withTrashed()->findOrFail($id);
        $contact->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn liên hệ thành công.',
        ]);
    }
}
