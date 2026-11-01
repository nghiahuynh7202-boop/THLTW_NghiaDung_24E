import { redirect } from "next/navigation";

/**
 * Trang /about chuyển hướng về /pages/gioi-thieu
 * Thống nhất toàn bộ trang Giới thiệu lấy từ CSDL (Quản lý tại /admin/pages)
 */
export default function AboutPage() {
  redirect("/pages/gioi-thieu");
}
