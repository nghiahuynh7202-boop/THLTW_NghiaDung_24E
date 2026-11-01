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
  };
}

// Hook tải sản phẩm và lọc theo danh mục / nổi bật
export function useProducts({ category } = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ per_page: 50 })
      .then((res) => {
        const rawList = res.data || res || [];
        const list = Array.isArray(rawList) ? rawList.map(formatProduct) : [];

        // Lọc sản phẩm nổi bật
        if (category === "featured" || category === "san-pham-noi-bat") {
          setProducts(list.filter((p) => p.is_featured));
        } else if (category === "flash-sale") {
          // Lấy 8 sản phẩm đầu cho mục Flash Sale
          setProducts(list.slice(0, 8));
        } else if (category) {
          // Lọc theo slug hoặc id danh mục
          const filtered = list.filter(
            (p) => p.category?.slug === category || String(p.category_id) === String(category)
          );
          setProducts(filtered.length > 0 ? filtered : list);
        } else {
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
