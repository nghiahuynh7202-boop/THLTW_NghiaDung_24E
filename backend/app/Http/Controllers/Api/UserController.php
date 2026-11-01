<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * GET /api/admin/users — Danh sách người dùng
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::latest('id');

        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        if ($request->filled('keyword')) {
            $keyword = trim((string) $request->input('keyword'));
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('email', 'like', "%{$keyword}%")
                  ->orWhere('phone', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status') && $request->input('status') !== '') {
            $query->where('status', (int) $request->input('status'));
        }

        $perPage = (int) $request->input('per_page', 10);
        $users = $query->paginate($perPage);

        return UserResource::collection($users);
    }

    /**
     * POST /api/admin/users — Thêm người dùng
     */
    public function store(UserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return (new UserResource($user))
            ->additional(['message' => 'Thêm người dùng thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/users/{id} hoặc GET /api/users/{id} — Chi tiết người dùng
     */
    public function show(mixed $user): UserResource
    {
        $userModel = $user instanceof User ? $user : User::findOrFail($user);

        return new UserResource($userModel);
    }

    /**
     * PUT|PATCH /api/admin/users/{user} — Cập nhật người dùng
     */
    public function update(UserRequest $request, mixed $user): JsonResponse
    {
        $userModel = $user instanceof User ? $user : User::findOrFail($user);
        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $userModel->update($data);

        return (new UserResource($userModel))
            ->additional(['message' => 'Cập nhật người dùng thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/users/{user} — Xóa tạm người dùng (vào thùng rác)
     */
    public function destroy(mixed $user): JsonResponse
    {
        $userModel = $user instanceof User ? $user : User::findOrFail($user);

        // Không cho phép xóa tài khoản Admin
        if ($userModel->role === 'admin') {
            return response()->json([
                'message' => 'Không được phép xóa tài khoản Quản trị viên (Admin)!',
            ], 403);
        }

        $userModel->delete();

        return response()->json([
            'message' => 'Xóa tạm người dùng thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/users/trash — Danh sách người dùng trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);
        $users = User::onlyTrashed()
            ->latest('deleted_at')
            ->paginate($perPage);

        return UserResource::collection($users);
    }

    /**
     * PATCH /api/admin/users/{id}/restore — Khôi phục người dùng từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();
        $user->update(['status' => 1]);

        return (new UserResource($user))
            ->additional(['message' => 'Khôi phục người dùng thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/users/{id}/force — Xóa vĩnh viễn người dùng
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn người dùng thành công.',
        ]);
    }

    /**
     * PATCH /api/admin/users/{id}/toggle-status — Khóa / Mở khóa tài khoản người dùng
     */
    public function toggleStatus(int|string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Không được phép khóa tài khoản Admin
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Không được phép khóa tài khoản Quản trị viên (Admin)!',
            ], 403);
        }

        $newStatus = (int) $user->status === 1 ? 0 : 1;
        $user->update(['status' => $newStatus]);

        $message = $newStatus === 1 ? 'Đã mở khóa tài khoản người dùng.' : 'Đã khóa tài khoản người dùng.';

        return response()->json([
            'message' => $message,
            'status'  => $newStatus,
            'data'    => new UserResource($user),
        ]);
    }

    /**
     * GET /api/admin/users/{id}/orders — Lấy danh sách đơn hàng của người dùng
     */
    public function orders(int|string $id): AnonymousResourceCollection
    {
        $user = User::findOrFail($id);
        $orders = Order::with(['details.product'])
            ->where('user_id', $user->id)
            ->latest('id')
            ->get();

        return OrderResource::collection($orders);
    }
}
