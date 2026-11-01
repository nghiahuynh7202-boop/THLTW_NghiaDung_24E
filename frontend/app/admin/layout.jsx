"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminHeader from "@/components/Admin/AdminHeader.jsx";
import Sidebar from "@/components/Admin/Sidebar.jsx";
import "./admin_style.css";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietNam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

/**
 * Layout Quản trị Admin
 * Phong cách sinh viên:
 * - Tách riêng trang /admin/login (không hiện sidebar và header)
 * - Kiểm tra quyền admin: Nếu chưa đăng nhập admin thì chuyển về /admin/login
 */
export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [isAuthorized, setIsAuthorized] = useState(isLoginPage);

  useEffect(() => {
    // Nếu đang ở trang đăng nhập admin thì không cần kiểm tra quyền
    if (isLoginPage) return;

    try {
      // Chỉ chấp nhận admin_token và admin_user riêng biệt
      const adminToken = localStorage.getItem("admin_token");
      const adminUserStr = localStorage.getItem("admin_user");
      const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;

      // Bắt buộc phải đăng nhập từ cổng /admin/login và role là 'admin'
      if (!adminToken || adminUser?.role !== "admin") {
        router.push("/admin/login");
      } else {
        setIsAuthorized(true);
      }
    } catch {
      router.push("/admin/login");
    }
  }, [pathname, isLoginPage, router]);

  // 1. Màn hình /admin/login: Chỉ hiển thị form đăng nhập gọn gàng
  if (isLoginPage) {
    return (
      <div className={`min-h-screen bg-slate-900 ${beVietNam.className}`}>
        {children}
      </div>
    );
  }

  // 2. Khi đang kiểm tra quyền Admin
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500 text-xs font-sans">
        Đang kiểm tra quyền Quản trị viên...
      </div>
    );
  }

  // 3. Toàn bộ các trang Quản trị Admin (/admin, /admin/products, ...)
  return (
    <div className={`bg-gray-100 text-gray-800 ${beVietNam.className}`}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />

          <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
