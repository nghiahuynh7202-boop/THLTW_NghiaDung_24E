"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Tag,
  LogOut,
  ExternalLink,
  Bell,
  Search,
  ChevronRight,
  Menu,
  X,
  Heart,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Danh mục menu chuẩn theo database của shop hoa
  const navigationItems = [
    { name: "Bảng Điều Khiển", href: "/admin", icon: LayoutDashboard },
    { name: "Quản Lý Đơn Hàng", href: "/admin/orders", icon: ShoppingBag, badge: "3" },
    { name: "Sản Phẩm Hoa", href: "/admin/products", icon: Package },
    { name: "Danh Mục Hoa", href: "/admin/categories", icon: Layers },
    { name: "Khuyến Mãi & Sale", href: "/admin/sales", icon: Tag },
    { name: "Banners Quảng Cáo", href: "/admin/banners", icon: ImageIcon },
    { name: "Bài Viết / Tin Tức", href: "/admin/posts", icon: FileText },
    { name: "Liên Hệ Khách Hàng", href: "/admin/contacts", icon: MessageSquare, badge: "2" },
    { name: "Khách Hàng / Users", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#fff5f7] flex font-sans antialiased text-gray-800">
      {/* 1. SIDEBAR MÀU TRẮNG HỒNG */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-pink-100 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-sm ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Sidebar: Logo Shop Hoa */}
        <div className="h-18 px-5 bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-between shadow-xs">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-pink-600 shadow-sm">
              <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-wide block">
                HOA YÊU THƯƠNG
              </span>
              <span className="text-[10px] text-pink-100 font-semibold uppercase tracking-wider block">
                Trang Quản Trị
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách Menu Sidebar */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-pink-400">
            MENU CHỨC NĂNG
          </div>

          {navigationItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/25 font-bold"
                    : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-pink-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white text-pink-600"
                        : "bg-pink-100 text-pink-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Sidebar: User Profile & Quick Link */}
        <div className="p-4 bg-pink-50/60 border-t border-pink-100 space-y-2.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-bold text-pink-700 bg-white border border-pink-200 hover:bg-pink-100/50 shadow-2xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem Cửa Hàng Khách</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-200 text-pink-700 font-bold flex items-center justify-center text-xs">
                AD
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-800 block">Quản Trị Viên</span>
                <span className="text-[10px] text-pink-500 font-medium block">admin@shophoa.vn</span>
              </div>
            </div>
            <Link
              href="/"
              title="Đăng xuất"
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* BACKDROP KHI MỞ MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-pink-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* 2. KHU VỰC NỘI DUNG CHÍNH (NỀN TRẮNG HỒNG NHẠT) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-pink-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-pink-50 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center text-xs text-pink-500 font-medium gap-1.5">
              <span>Hệ thống shop hoa</span>
              <ChevronRight className="w-3.5 h-3.5 text-pink-300" />
              <span className="text-gray-800 font-bold">Trang Quản Lý</span>
            </div>
          </div>

          {/* Search bar & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative hidden md:block w-64">
              <input
                type="text"
                placeholder="Tìm đơn hàng, mẫu hoa..."
                className="w-full bg-pink-50/60 border border-pink-100 focus:border-pink-400 focus:bg-white text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all placeholder-pink-300 text-gray-700"
              />
              <Search className="w-3.5 h-3.5 text-pink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              className="relative p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            </button>
          </div>
        </header>

        {/* Nội dung trang admin */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
