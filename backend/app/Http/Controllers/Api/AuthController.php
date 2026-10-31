<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * File này làm gì: Xử lý đăng ký, đăng nhập và thông tin tài khoản bằng Laravel Sanctum.
 * Cấp và thu hồi Bearer Token để xác thực người dùng.
 */
class AuthController extends Controller
{
    // Đăng ký tài khoản khách hàng mới và tự động cấp Bearer Token
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['role'] = 'customer';
        $data['status'] = 1;

        $user = User::create($data);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng ký tài khoản thành công.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => new UserResource($user),
        ], 201);
    }

    // Đăng nhập: kiểm tra email, mật khẩu và trạng thái hoạt động
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();

        // 1. Kiểm tra tài khoản và mật khẩu
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác.',
            ], 401);
        }

        // 2. Kiểm tra tài khoản có bị khóa không
        if ($user->status !== 1) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt.',
            ], 403);
        }

        // 3. Cấp Bearer Token mới qua Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng nhập thành công.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => new UserResource($user),
        ]);
    }

    // Xem thông tin cá nhân của tài khoản đang đăng nhập
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    // Cập nhật thông tin cá nhân (họ tên, số điện thoại, địa chỉ)
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật thông tin tài khoản thành công.',
            'user'    => new UserResource($user),
        ]);
    }

    // Đổi mật khẩu
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không chính xác.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($data['password']),
        ]);

        return response()->json([
            'message' => 'Đổi mật khẩu thành công.',
        ]);
    }

    // Đăng xuất: xóa token hiện tại trong bảng personal_access_tokens
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công (đã hủy token).',
        ]);
    }
}
