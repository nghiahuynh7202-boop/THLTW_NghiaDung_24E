"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, User, ChevronDown, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-2xs select-none">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">Hệ thống Quản trị Shop Hoa</span>
        <span className="hidden md:inline text-gray-300">|</span>
        <div className="hidden md:flex items-center gap-1.5 text-gray-500">
          <Phone className="w-3.5 h-3.5 text-amber-500" />
          <span>Hỗ trợ: <strong>1900 9477</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center text-xs text-[#2980b9] hover:underline"
        >
          Xem Website
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="font-semibold text-gray-700 leading-tight">
              {user?.name || "ShopHoa_Admin"}
            </div>
            <div className="text-[10px] text-gray-400">Quản trị viên</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Bạn muốn đăng xuất?")) {
              logout();
              window.location.href = "/login";
            }
          }}
          className="flex items-center gap-1 text-gray-500 hover:text-rose-600 transition ml-2 p-1.5 rounded-lg hover:bg-gray-100"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
