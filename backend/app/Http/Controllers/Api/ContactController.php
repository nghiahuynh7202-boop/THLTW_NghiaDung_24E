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
     * GET /api/admin/contacts — Danh sách liên hệ
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Contact::with('user')->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $perPage = (int) $request->input('per_page', 12);
        $contacts = $query->paginate($perPage);

        return ContactResource::collection($contacts);
    }

    /**
     * POST /api/contacts hoặc POST /api/admin/contacts — Gửi liên hệ mới
     */
    public function store(ContactRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($request->user()) {
            $data['user_id'] = $data['user_id'] ?? $request->user()->id;
        }

        $contact = Contact::create($data);

        return (new ContactResource($contact))
            ->additional(['message' => 'Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/contacts/{id} — Chi tiết liên hệ
     */
    public function show($id): ContactResource
    {
        $contact = Contact::with('user')->findOrFail($id);

        if ($contact->status === 'chua_xem') {
            $contact->update(['status' => 'da_xem']);
        }

        return new ContactResource($contact);
    }

    /**
     * PUT|PATCH /api/admin/contacts/{contact} — Cập nhật / phản hồi liên hệ
     */
    public function update(ContactRequest $request, Contact $contact): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['reply']) && empty($contact->replied_at)) {
            $data['replied_at'] = now();
            $data['status'] = $data['status'] ?? 'da_tra_loi';
        }

        $contact->update($data);

        return (new ContactResource($contact))
            ->additional(['message' => 'Cập nhật liên hệ thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/contacts/{contact} — Xóa tạm liên hệ
     */
    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();

        return response()->json([
            'message' => 'Xóa tạm liên hệ thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/contacts/trash — Danh sách liên hệ trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);
        $contacts = Contact::onlyTrashed()
            ->with('user')
            ->latest('deleted_at')
            ->paginate($perPage);

        return ContactResource::collection($contacts);
    }

    /**
     * PATCH /api/admin/contacts/{id}/restore — Khôi phục liên hệ từ thùng rác
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
     * DELETE /api/admin/contacts/{id}/force — Xóa vĩnh viễn liên hệ
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
