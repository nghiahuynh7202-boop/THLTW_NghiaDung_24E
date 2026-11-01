<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Mail\ResetPasswordOtpMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

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

    // Cập nhật thông tin cá nhân (họ tên, số điện thoại, địa chỉ) - Lưu trực tiếp vào CSDL
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user && $request->filled('user_id')) {
            $user = User::find($request->input('user_id'));
        }

        if (! $user) {
            return response()->json(['message' => 'Vui lòng đăng nhập để cập nhật.'], 401);
        }

        $validated = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

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

    // Gửi mã OTP khôi phục mật khẩu về Gmail của khách
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.required' => 'Vui lòng nhập địa chỉ email của bạn.',
            'email.email'    => 'Địa chỉ email không đúng định dạng.',
            'email.exists'   => 'Không tìm thấy tài khoản nào khớp với email này.',
        ]);

        $user = User::where('email', $request->email)->first();

        // Tạo mã OTP ngẫu nhiên 6 chữ số (VD: 849201)
        $otp = (string) rand(100000, 999999);

        // Lưu hoặc ghi đè OTP vào bảng password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token'      => $otp,
                'created_at' => now(),
            ]
        );

        // Gửi email chứa mã OTP
        try {
            Mail::to($request->email)->send(new ResetPasswordOtpMail($otp, $user->name));
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Lỗi kết nối gửi email: ' . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Mã xác nhận OTP đã được gửi về Gmail của bạn. Vui lòng kiểm tra hộp thư!',
        ]);
    }

    // Xác nhận mã OTP và đặt lại mật khẩu mới
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email|exists:users,email',
            'otp'      => 'required|string',
            'password' => 'required|string|min:6',
        ], [
            'email.required'    => 'Vui lòng nhập địa chỉ email.',
            'otp.required'      => 'Vui lòng nhập mã xác thực OTP.',
            'password.required' => 'Vui lòng nhập mật khẩu mới.',
            'password.min'      => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
        ]);

        // Kiểm tra OTP trong bảng password_reset_tokens
        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', trim($request->otp))
            ->first();

        if (! $tokenRecord) {
            return response()->json([
                'message' => 'Mã xác nhận OTP không chính xác!',
            ], 422);
        }

        // Kiểm tra thời hạn 15 phút
        if (now()->diffInMinutes($tokenRecord->created_at) > 15) {
            return response()->json([
                'message' => 'Mã OTP đã hết hiệu lực (quá 15 phút). Vui lòng gửi lại yêu cầu mới!',
            ], 422);
        }

        // Cập nhật mật khẩu mới cho người dùng
        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Xóa mã OTP đã sử dụng
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.',
        ]);
    }
}
