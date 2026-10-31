"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/services/productServices";

// Hook tải sản phẩm và lọc theo danh mục / nổi bật
export function useProducts({ category } = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProducts({ per_page: 50 })
      .then((res) => {
        const list = res.data || res || [];

        // Lọc sản phẩm nổi bật
        if (category === "featured" || category === "san-pham-noi-bat") {
          setProducts(list.filter((p) => Number(p.is_featured) === 1));
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
