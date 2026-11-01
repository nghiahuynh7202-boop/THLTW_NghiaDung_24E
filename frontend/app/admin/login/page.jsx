"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import API_CONFIG from "@/config/api";
import { Shield, Lock, Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

/**
 * TRANG ĐĂNG NHẬP RIÊNG BIỆT DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
 * - Tách riêng hoàn toàn với trang đăng nhập của khách hàng
 * - Chỉ cho phép tài khoản có quyền `role === 'admin'` đăng nhập
 * - Lưu phiên đăng nhập vào `admin_token` và `admin_user`
 */
export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý gửi form đăng nhập Admin
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Gửi email & mật khẩu lên API đăng nhập
      const res = await axios.post(`${API_CONFIG.BASE_URL}/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const { user, access_token } = res.data;

      // 2. KIỂM TRA PHÂN QUYỀN: Bắt buộc phải là Quản trị viên (admin)
      if (user?.role !== "admin") {
        setError("Tài khoản này không có quyền Quản trị viên! Vui lòng dùng tài khoản Admin.");
        setLoading(false);
        return;
      }

      // 3. Lưu token & user vào localStorage RIÊNG BIỆT của Admin
      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      // 4. Chuyển hướng ngay lập tức vào trang quản trị
      window.location.href = "/admin";
    } catch (err) {
      setError(
        err.response?.data?.message || "Email hoặc mật khẩu Admin không chính xác!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Logo Admin */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
            Quản Trị Hệ Thống
          </h1>
          <p className="text-xs text-slate-400">
            Cổng đăng nhập bảo mật dành riêng cho Quản trị viên (Admin)
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form đăng nhập Admin */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Quản trị viên
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật khẩu Admin
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực quyền Admin...</span>
              </>
            ) : (
              <span>Đăng Nhập Vào Quản Trị</span>
            )}
          </button>
        </form>

        {/* Nút quay lại shop cho khách */}
        <div className="pt-2 border-t border-slate-700/60 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang bán hàng Shop Hoa</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
