"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/services/productServices";

// Hàm chuẩn hóa sản phẩm: giữ price luôn là giá gốc, salePrice là giá sau giảm (null nếu không có sale)
export function formatProduct(p) {
  if (!p) return null;
  const price = Number(p.price || 0);
  const rawSale =
    p.sale_price !== null && p.sale_price !== undefined && p.sale_price !== ""
      ? Number(p.sale_price)
      : null;
  const hasSale = rawSale !== null && rawSale > 0 && rawSale < price;

  return {
    ...p,
    id: p.id,
    name: p.name || "",
    slug: p.slug || String(p.id),
    price: price, // Luôn luôn là giá gốc
    salePrice: hasSale ? rawSale : null, // Giá sau giảm (null nếu không có sale)
    image: p.image || "",
    category_id: p.category_id,
    category: p.category,
    is_featured: Number(p.is_featured ?? 0) === 1,
    qty: Number(p.qty ?? 0),
    sold_count: Number(p.sold_count ?? 0), // Số lượng bán thực tế từ CSDL
    created_at: p.created_at,
  };
}

/**
 * Hook tải sản phẩm và lọc theo danh mục / nổi bật / flash sale / mới / hot bán chạy
 * Phong cách sinh viên: Ngắn gọn, chia nhánh if/else rõ ràng, dễ giải thích
 */
export function useProducts({ category } = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ per_page: 100 })
      .then((res) => {
        const rawList = res.data || res || [];
        const list = Array.isArray(rawList) ? rawList.map(formatProduct) : [];

        // 1. Sản phẩm nổi bật
        if (category === "featured" || category === "san-pham-noi-bat") {
          const featured = list.filter((p) => p.is_featured);
          setProducts(featured.slice(0, 8));
        } 
        // 2. Flash Sale: CHỈ LẤY SẢN PHẨM CÓ GIÁ GIẢM (salePrice < price)
        else if (category === "flash-sale") {
          const saleList = list.filter((p) => p.salePrice && p.salePrice < p.price);
          setProducts(saleList.slice(0, 8));
        } 
        // 3. SẢN PHẨM MỚI: Sắp xếp theo created_at / id mới nhất trước, lấy 8 sản phẩm đầu
        else if (category === "new" || category === "san-pham-moi") {
          const sortedNew = [...list].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : a.id;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : b.id;
            return timeB - timeA;
          });
          setProducts(sortedNew.slice(0, 8));
        }
        // 4. SẢN PHẨM HOT / BÁN CHẠY: Sắp xếp theo số lượng bán thật (sold_count) giảm dần
        else if (category === "hot" || category === "san-pham-hot" || category === "ban-chay") {
          const hotList = [...list]
            .filter((p) => Number(p.sold_count || 0) > 0)
            .sort((a, b) => Number(b.sold_count || 0) - Number(a.sold_count || 0));

          // Nếu chưa có sản phẩm nào bán được thì hiện sản phẩm nổi bật thay thế, không để trống
          if (hotList.length > 0) {
            setProducts(hotList.slice(0, 8));
          } else {
            const fallbackFeatured = list.filter((p) => p.is_featured);
            setProducts((fallbackFeatured.length > 0 ? fallbackFeatured : list).slice(0, 8));
          }
        }
        // 5. Theo danh mục cụ thể từ CSDL
        else if (category) {
          const filtered = list.filter(
            (p) => p.category?.slug === category || String(p.category_id) === String(category)
          );
          setProducts(filtered);
        } 
        // 6. Toàn bộ danh sách
        else {
          setProducts(list);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải sản phẩm:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [category]);

  return { products, loading };
}

export default useProducts;
