"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Header thanh công cụ của trang Quản trị Admin
 * Phong cách sinh viên: Đăng xuất riêng biệt, chỉ xóa phiên admin và về /admin/login
 */
export default function AdminHeader() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_user") || localStorage.getItem("user");
      if (saved) setAdminUser(JSON.parse(saved));
    } catch {}
  }, []);

  // Đăng xuất riêng của Quản trị viên
  const handleAdminLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang Quản trị Admin?")) {
      // Chỉ xóa phiên đăng nhập của Admin, không ảnh hưởng phiên khách nếu có
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      alert("Đăng xuất Admin thành công!");
      router.push("/admin/login");
    }
  };

  const adminName = adminUser?.name || "ShopHoa_Admin";

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-2xs select-none">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">Hệ thống Quản trị Shop Hoa</span>
        <span className="hidden md:inline text-gray-300">|</span>
        <div className="hidden md:flex items-center gap-1.5 text-gray-500">
          <Phone className="w-3.5 h-3.5 text-amber-500" />
          <span>Hỗ trợ kỹ thuật: <strong>1900 9477</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center text-xs text-[#2980b9] hover:underline"
        >
          Xem Website bán hàng
        </Link>

        {/* Thông tin Admin đang đăng nhập */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
            {adminName.trim().charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-semibold text-gray-700 leading-tight">
              {adminName}
            </div>
            <div className="text-[10px] text-gray-400">Quản trị viên (Admin)</div>
          </div>
        </div>

        {/* Nút Đăng xuất riêng của Admin */}
        <button
          type="button"
          onClick={handleAdminLogout}
          className="flex items-center gap-1 text-gray-500 hover:text-rose-600 transition ml-2 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          title="Đăng xuất khỏi trang Admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
