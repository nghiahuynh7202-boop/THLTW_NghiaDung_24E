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
  Phone,
  Mail,
  User,
  ChevronDown,
  Menu,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Danh mục menu chuẩn của shop hoa (giữ nguyên đầy đủ như cũ)
  const navigationItems = [
    { name: "Trang chủ", href: "/admin", icon: LayoutDashboard },
    { name: "Quản lý đơn hàng", href: "/admin/orders", icon: ShoppingBag, badge: "3" },
    { name: "Quản lý sản phẩm", href: "/admin/products", icon: Package },
    { name: "Quản lý danh mục", href: "/admin/category", icon: Layers },
    { name: "Khuyến mãi & Sale", href: "/admin/sales", icon: Tag },
    { name: "Quản lý banner", href: "/admin/banners", icon: ImageIcon },
    { name: "Quản lý bài viết", href: "/admin/posts", icon: FileText },
    { name: "Quản lý thư liên hệ", href: "/admin/contacts", icon: MessageSquare, badge: "2" },
    { name: "Quản lý khách hàng", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f1f2f7] flex flex-col font-sans antialiased text-[#333] text-xs">
      {/* 1. TOP NAVBAR THEO PHONG CÁCH WEB30S (MÀU XANH #2980b9) */}
      <header className="h-[46px] bg-[#2980b9] flex items-center justify-between sticky top-0 z-40 shadow-xs select-none text-white text-xs">
        {/* Nút toggle Sidebar bên trái */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-[46px] w-[50px] bg-[#2471a3] hover:bg-[#1f618d] flex items-center justify-center text-white transition-colors"
            title="Thu gọn menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Thông tin hỗ trợ & Profile ở giữa và bên phải */}
        <div className="flex-1 flex items-center justify-end px-4 gap-4 sm:gap-6 text-white/95 overflow-x-auto text-[11px] sm:text-xs">
          <div className="hidden md:flex items-center gap-1.5 hover:text-white cursor-pointer">
            <Phone className="w-3.5 h-3.5 text-yellow-300" />
            <span>Hỗ trợ 24/7: <strong>1900 9477</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 hover:text-white cursor-pointer">
            <Mail className="w-3.5 h-3.5 text-yellow-300" />
            <span>support@shophoa.vn</span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
            <User className="w-3.5 h-3.5 text-yellow-300" />
            <span className="font-semibold">ShopHoa_Admin</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 hover:text-white cursor-pointer">
            <span>🇻🇳 Việt Nam</span>
            <ChevronDown className="w-3 h-3" />
          </div>

          <Link
            href="/"
            title="Đăng xuất"
            className="flex items-center gap-1 hover:text-yellow-300 transition-colors pl-2 border-l border-white/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline-block">Đăng xuất</span>
          </Link>
        </div>
      </header>

      {/* 2. BODY CHÍNH (SIDEBAR ĐEN + NỘI DUNG) */}
      <div className="flex-1 flex min-h-[calc(100vh-46px)]">
        {/* SIDEBAR TỐI #1e2428 */}
        <aside
          className={`bg-[#1e2428] text-[#9aa8b1] flex flex-col shrink-0 transition-all duration-300 select-none border-r border-[#15191c] ${
            sidebarOpen ? "w-60" : "w-14"
          }`}
        >
          {/* Logo Header ở đầu Sidebar */}
          {sidebarOpen ? (
            <div className="p-3.5 bg-[#161a1d] border-b border-[#252c31] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-400 flex items-center justify-center text-slate-900 font-extrabold shadow-sm shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-white text-xs tracking-wide truncate">
                  ShopHoa_Manager
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Link href="/" target="_blank" className="hover:text-yellow-400">
                    Xem Website
                  </Link>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="hover:text-yellow-400 text-rose-400"
                  >
                    Xóa Cache
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-3 flex justify-center bg-[#161a1d] border-b border-[#252c31]">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-slate-900 font-bold">
                W
              </div>
            </div>
          )}

          {/* Tiêu đề nhóm Sidebar */}
          {sidebarOpen && (
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#63747e] bg-[#161a1d]/60">
              CHỨC NĂNG HỆ THỐNG
            </div>
          )}

          {/* Danh sách Menu Sidebar */}
          <nav className="flex-1 py-1 overflow-y-auto space-y-0.5 text-xs font-medium">
            {navigationItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${
                    isActive
                      ? "bg-[#2980b9] text-white font-bold shadow-xs border-l-3 border-yellow-400"
                      : "text-[#9aa8b1] hover:bg-[#252c31] hover:text-white"
                  }`}
                  title={item.name}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-[#7a8b94]"
                      }`}
                    />
                    {sidebarOpen && <span>{item.name}</span>}
                  </div>
                  {sidebarOpen && item.badge && (
                    <span className="bg-[#e74c3c] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* NỘI DUNG CHÍNH (NỀN TRẮNG XÁM GỌN GÀNG) */}
        <main className="flex-1 p-4 sm:p-5 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
