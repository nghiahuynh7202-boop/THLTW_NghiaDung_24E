"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Tag,
  Sparkles,
  FolderTree,
  Menu as MenuIcon,
  Globe,
  Warehouse,
  Truck,
} from "lucide-react";

const navigationItems = [
  { name: "Trang chủ", href: "/admin", icon: LayoutDashboard },
  { name: "Quản lý đơn hàng", href: "/admin/order", icon: ShoppingBag, badge: "3" },
  { name: "Quản lý sản phẩm", href: "/admin/products", icon: Package },
  { name: "Quản lý kho hàng", href: "/admin/stocks", icon: Warehouse },
  { name: "Quản lý nhà cung cấp", href: "/admin/suppliers", icon: Truck },
  { name: "Quản lý danh mục", href: "/admin/category", icon: Layers },
  { name: "Quản lý thương hiệu", href: "/admin/brands", icon: Award },
  { name: "Khuyến mãi & Sale", href: "/admin/sales", icon: Tag },
  { name: "Quản lý banner", href: "/admin/banners", icon: ImageIcon },
  { name: "Chủ đề bài viết", href: "/admin/post-topics", icon: FolderTree },
  { name: "Quản lý bài viết", href: "/admin/posts", icon: FileText },
  { name: "Quản lý trang đơn", href: "/admin/pages", icon: Globe },
  { name: "Quản lý Menu", href: "/admin/menus", icon: MenuIcon },
  { name: "Quản lý thư liên hệ", href: "/admin/contacts", icon: MessageSquare, badge: "2" },
  { name: "Quản lý khách hàng", href: "/admin/users", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1e2428] text-[#9aa8b1] flex flex-col shrink-0 select-none border-r border-[#15191c] h-screen">
      {/* Brand logo header */}
      <div className="p-4 bg-[#161a1d] border-b border-[#252c31] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-900 font-extrabold shadow-sm shrink-0">
          <Sparkles className="w-5 h-5 text-slate-900" />
        </div>
        <div className="overflow-hidden">
          <div className="font-bold text-white text-sm tracking-wide truncate">
            ShopHoa Manager
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Link href="/" target="_blank" className="hover:text-amber-400">
              Xem Shop
            </Link>
            <span>•</span>
            <span className="text-emerald-400">Online</span>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#63747e] bg-[#161a1d]/60">
        CHỨC NĂNG HỆ THỐNG
      </div>

      {/* Menu links */}
      <nav className="flex-1 py-2 overflow-y-auto space-y-0.5 text-xs font-medium px-2">
        {navigationItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#2980b9] text-white font-semibold shadow-xs"
                  : "text-[#9aa8b1] hover:bg-[#252c31] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#7a8b94]"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
