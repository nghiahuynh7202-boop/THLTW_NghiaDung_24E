"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/services/productServices";

function formatProduct(p) {
  const hasSale = p.sale_price && Number(p.sale_price) < Number(p.price);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug || String(p.id),
    price: hasSale ? Number(p.sale_price) : Number(p.price || 0),
    originalPrice: hasSale ? Number(p.price) : null,
    image: p.image || "/images/hoa.jpg",
    category_slug: p.category?.slug,
    category_id: p.category_id,
    is_featured: Number(p.is_featured ?? 0) === 1,
  };
}

export function useProducts({ category, tag } = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        // Gọi API lấy toàn bộ sản phẩm thực tế từ cơ sở dữ liệu SQL
        const res = await getProducts({ per_page: 50 });
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];

        if (!isMounted) return;

        const formatted = list.map(formatProduct);

        let filtered = formatted;

        // Phân bổ sản phẩm thực tế từ SQL vào từng khu vực hiển thị
        if (
          category === "featured" ||
          category === "san-pham-noi-bat" ||
          category === "hoa-tinh-yeu"
        ) {
          const featured = formatted.filter((p) => p.is_featured);
          filtered = featured;
        } else if (category === "flash-sale") {
          // CHỈ RIÊNG KHU VỰC FLASH SALE: Áp dụng giá Flash Sale đặc biệt có gạch chéo giá gốc
          const discounts = [0.15, 0.25, 0.20, 0.18, 0.22, 0.28, 0.16, 0.24];
          filtered = formatted.slice(0, 8).map((p, idx) => {
            if (p.originalPrice && p.originalPrice > p.price) return p;
            const rate = discounts[idx % discounts.length];
            const flashPrice = Math.round((p.price * (1 - rate)) / 10000) * 10000;
            return {
              ...p,
              originalPrice: p.price,
              price: flashPrice < p.price ? flashPrice : p.price - 20000,
            };
          });
        } else if (category === "hoa-sinh-nhat") {
          const match = formatted.filter((p) => p.category_slug === "hoa-sinh-nhat");
          filtered = match.length > 0 ? match : formatted.slice(0, 5);
        } else if (category === "hoa-khai-truong") {
          const match = formatted.filter((p) => p.category_slug === "hoa-khai-truong");
          filtered = match.length > 0 ? match : formatted.slice(3, 8);
        } else if (category) {
          const match = formatted.filter(
            (p) => p.category_slug === category || String(p.category_id) === String(category)
          );
          filtered = match.length > 0 ? match : formatted;
        }

        setProducts(filtered);
      } catch (error) {
        console.error("Lỗi tải sản phẩm từ SQL:", error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [category, tag]);

  return { products, loading };
}

export default useProducts;

