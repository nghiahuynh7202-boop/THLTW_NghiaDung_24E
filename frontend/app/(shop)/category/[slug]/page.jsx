import { redirect } from "next/navigation";

/**
 * Trang danh mục: chuyển hướng /category/[slug] sang /products?category=[slug]
 * Phong cách sinh viên: Tái sử dụng trang products sẵn có, không viết lặp code, không bao giờ bị 404
 */
export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  redirect(`/products?category=${slug}`);
}
