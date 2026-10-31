"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * AdminGuard — Bọc bên ngoài các trang admin để bảo vệ route.
 * - Nếu chưa đăng nhập → redirect về /login
 * - Nếu đã đăng nhập nhưng không phải admin → redirect về /
 * - Nếu đang load → hiển thị màn hình chờ
 */
export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Đang kiểm tra auth — hiện loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập hoặc không phải admin — không render gì (đã redirect)
  if (!user || user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
