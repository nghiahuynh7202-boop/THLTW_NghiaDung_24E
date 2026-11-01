"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import API_CONFIG from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Loader2 } from "lucide-react";

/**
 * TRANG ĐĂNG NHẬP DÀNH CHO KHÁCH HÀNG MUA HOA
 * - Dành riêng cho tài khoản người dùng/khách hàng mua sắm
 * - Trang đăng nhập của Quản trị viên nằm riêng biệt tại: /admin/login
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý gửi form đăng nhập khách hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_CONFIG.BASE_URL}/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const { user, access_token } = res.data;

      // Lưu phiên đăng nhập khách hàng vào context và localStorage
      login(user, access_token);
      alert("Đăng nhập thành công!");

      // Đăng nhập ở trang khách hàng thì LUÔN LUÔN về trang chủ mua hoa (/), tuyệt đối không vào trang Admin
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không chính xác!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-gray-50 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Đăng Nhập Khách Hàng
          </h1>
          <p className="text-xs text-gray-500">
            Đăng nhập để theo dõi đơn hàng và lưu giỏ hoa của bạn
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mật khẩu
            </label>
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

      </div>
    </div>
  );
}
