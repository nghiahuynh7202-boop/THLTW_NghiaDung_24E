<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
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

        $perPage = (int) $request->input('per_page', 12);
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
    public function show($id): UserResource
    {
        $user = User::findOrFail($id);

        return new UserResource($user);
    }

    /**
     * PUT|PATCH /api/admin/users/{user} — Cập nhật người dùng
     */
    public function update(UserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return (new UserResource($user))
            ->additional(['message' => 'Cập nhật người dùng thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/users/{user} — Xóa tạm người dùng (vào thùng rác)
     */
    public function destroy(User $user): JsonResponse
    {
        $user->update(['status' => 0]);
        $user->delete();

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
}
