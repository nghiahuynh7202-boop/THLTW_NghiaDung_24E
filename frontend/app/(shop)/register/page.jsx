"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import API_CONFIG from "@/config/api";

/**
 * File này làm gì: Giao diện và logic Đăng ký tài khoản khách hàng mới.
 * Gửi thông tin (tên, email, số điện thoại, mật khẩu) lên API /api/register.
 */
export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Xử lý gửi form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Mật khẩu phải có tối thiểu 6 ký tự!");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/register`, {
        name,
        email,
        phone,
        password,
      });

      alert("Đăng ký thành công! Hãy đăng nhập tài khoản của bạn.");
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký không thành công. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Đăng Ký Tài Khoản
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại (tùy chọn)..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu ít nhất 6 ký tự..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white font-semibold rounded text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-[#B83A63] hover:text-[#9E2F54] font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
