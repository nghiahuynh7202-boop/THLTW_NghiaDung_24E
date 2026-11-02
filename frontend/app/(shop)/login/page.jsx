"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import API_CONFIG from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Loader2, KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * TRANG ĐĂNG NHẬP KHÁCH HÀNG & QUÊN MẬT KHẨU GỬI OTP QUA GMAIL
 * - Đăng nhập khách hàng
 * - Khôi phục mật khẩu: Nhận mã OTP 6 số qua Gmail thật -> Nhập OTP đổi mật khẩu mới
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Chế độ hiển thị: "login" (Đăng nhập) | "forgot" (Nhập email) | "otp" (Nhập OTP) | "new-password" (Nhập MK mới)
  const [mode, setMode] = useState("login");

  // Dữ liệu đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Dữ liệu quên mật khẩu & đặt lại
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Trạng thái xử lý & thông báo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 1. XỬ LÝ ĐĂNG NHẬP
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const { user, access_token } = res.data;
      login(user, access_token);
      alert("Đăng nhập thành công!");
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  // 2. BƯỚC 1: XỬ LÝ GỬI MÃ OTP QUA GMAIL
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!forgotEmail.trim()) {
      setError("Vui lòng nhập email đăng ký tài khoản của bạn!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/forgot-password`, {
        email: forgotEmail.trim(),
      });

      setSuccessMsg(res.data?.message || "Đã gửi mã OTP về Gmail!");
      setMode("otp"); // Chuyển sang màn hình CHỈ NHẬP OTP
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi mã OTP. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // 3. BƯỚC 2: XỬ LÝ XÁC THỰC MÃ OTP (TRANG RIÊNG)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP 6 số đã nhận trong Gmail!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/verify-otp`, {
        email: forgotEmail.trim(),
        otp: otp.trim(),
      });

      setSuccessMsg(res.data?.message || "Mã OTP chính xác! Mời bạn đặt mật khẩu mới.");
      setMode("new-password"); // Chuyển sang trang riêng để nhập mật khẩu mới
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  // 4. BƯỚC 3: XỬ LÝ ĐẶT LẠI MẬT KHẨU MỚI (TRANG RIÊNG)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới không trùng khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/reset-password`, {
        email: forgotEmail.trim(),
        otp: otp.trim(),
        password: newPassword,
      });

      // Thành công: Điền sẵn email và chuyển về form Đăng nhập
      setEmail(forgotEmail.trim());
      setPassword("");
      setMode("login");
      setSuccessMsg(res.data?.message || "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-gray-50 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* ======================= 1. GIAO DIỆN ĐĂNG NHẬP ======================= */}
        {mode === "login" && (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Đăng Nhập
              </h1>
              <p className="text-xs text-gray-500">
                Đăng nhập để theo dõi đơn hàng và lưu giỏ hoa của bạn
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email đăng ký
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setForgotEmail(email);
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-[11px] text-[#B83A63] hover:underline cursor-pointer font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white font-bold rounded-xl text-xs transition duration-150 disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span>Đăng Nhập</span>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Chưa có tài khoản?</span>
              <Link
                href="/register"
                className="text-[#B83A63] font-semibold hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </>
        )}

        {/* ======================= 2. BƯỚC 1: NHẬP EMAIL NHẬN OTP ======================= */}
        {mode === "forgot" && (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <KeyRound className="w-6 h-6 text-[#B83A63]" />
                <span>Quên Mật Khẩu</span>
              </h1>
              <p className="text-xs text-gray-500">
                Nhập email của bạn để nhận mã xác nhận OTP qua Gmail
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email tài khoản
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Nhập email bạn đã đăng ký"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white font-bold rounded-xl text-xs transition duration-150 disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ĐANG GỬI MÃ QUA GMAIL...</span>
                  </>
                ) : (
                  <span>Gửi Mã Xác Nhận OTP</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại đăng nhập</span>
              </button>
            </form>
          </>
        )}

        {/* ======================= 3. BƯỚC 2: TRANG RIÊNG CHỈ NHẬP MÃ OTP ======================= */}
        {mode === "otp" && (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <KeyRound className="w-6 h-6 text-[#B83A63]" />
                <span>Xác Thực Mã OTP</span>
              </h1>
              <p className="text-xs text-gray-500">
                Mã OTP 6 số đã được gửi đến: <strong className="text-gray-700">{forgotEmail}</strong>
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5 text-center">
                  Mã xác thực OTP (6 số trong Gmail)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="VD: 134719"
                  className="w-full py-3 bg-pink-50/50 border-2 border-pink-300 rounded-xl text-center text-2xl font-black tracking-widest text-[#B83A63] placeholder-gray-300 focus:outline-none focus:border-[#B83A63] focus:ring-2 focus:ring-[#B83A63]/20"
                />
                <p className="text-[11px] text-gray-400 text-center mt-1.5">
                  Mã có hiệu lực trong vòng 15 phút
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white font-bold rounded-xl text-xs transition duration-150 disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ĐANG XÁC THỰC MÃ...</span>
                  </>
                ) : (
                  <span>Xác Nhận Mã OTP</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-gray-500 hover:text-[#B83A63] underline cursor-pointer"
                >
                  Gửi lại mã OTP
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Đổi email khác</span>
                </button>
              </div>
            </form>
          </>
        )}

        {/* ======================= 4. BƯỚC 3: TRANG RIÊNG CHỈ ĐẶT LẠI MẬT KHẨU MỚI ======================= */}
        {mode === "new-password" && (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Đặt Lại Mật Khẩu Mới
              </h1>
              <p className="text-xs text-gray-500">
                Tạo mật khẩu mới cho tài khoản: <strong className="text-gray-700">{forgotEmail}</strong>
              </p>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập ít nhất 6 ký tự"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white font-bold rounded-xl text-xs transition duration-150 disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ĐANG ĐỔI MẬT KHẨU...</span>
                  </>
                ) : (
                  <span>Xác Nhận Đổi Mật Khẩu</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại đăng nhập</span>
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
