"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/services/productServices";

// Dữ liệu mẫu đẹp mắt khi database chưa có đủ sản phẩm
const SAMPLE_PRODUCTS = [
  { id: "s1", name: "Bó Hoa Nắng Ban Mai", slug: "nang-ban-mai", price: 350000, originalPrice: 420000, image: "/images/hoa.jpg" },
  { id: "s2", name: "Victo Rose Tươi Tắn", slug: "victo-rose", price: 300000, originalPrice: 380000, image: "/images/hoa.jpg" },
  { id: "s3", name: "My Sun Rực Rỡ", slug: "my-sun", price: 150000, originalPrice: 220000, image: "/images/hoa.jpg" },
  { id: "s4", name: "Yêu Thương Đong Đầy", slug: "yeu-thuong", price: 350000, originalPrice: 420000, image: "/images/hoa.jpg" },
  { id: "s5", name: "Mini Flower Vase 06", slug: "mini-flower-vase-06", price: 350000, originalPrice: 400000, image: "/images/hoa.jpg" },
  { id: "s6", name: "Ngọt Ngào Tuổi Mới", slug: "ngot-ngao", price: 350000, originalPrice: 420000, image: "/images/hoa.jpg" },
  { id: "s7", name: "An Nhiên Thanh Lịch", slug: "an-nhien", price: 650000, originalPrice: 790000, image: "/images/hoa.jpg" },
  { id: "s8", name: "Xinh Tươi Rạng Ngời", slug: "xinh-tuoi", price: 300000, originalPrice: 380000, image: "/images/hoa.jpg" },
  { id: "s9", name: "Pastel Love", slug: "pastel-love", price: 400000, originalPrice: 490000, image: "/images/hoa.jpg" },
  { id: "s10", name: "Thơ Mộng Sắc Hoa", slug: "tho-mong", price: 350000, originalPrice: 420000, image: "/images/hoa.jpg" },
];

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
        const res = await getProducts({ per_page: 40 });
        const list = Array.isArray(res) ? res : res?.data || [];
        const formatted = list.length > 0 ? list.map(formatProduct) : SAMPLE_PRODUCTS;

        if (!isMounted) return;

        let filtered = formatted;

        // Phân loại theo khung
        if (category === "flash-sale") {
          const saleOnly = formatted.filter((p) => p.originalPrice);
          filtered = saleOnly.length >= 4 ? saleOnly.slice(0, 10) : formatted.slice(0, 10);
        } else if (category === "hoa-sinh-nhat") {
          filtered = formatted.slice(0, 10);
        } else if (category === "hoa-khai-truong") {
          filtered = formatted.slice(4, 14).length >= 4 ? formatted.slice(4, 14) : formatted.slice(0, 10);
        } else if (category === "hoa-tinh-yeu") {
          filtered = formatted.slice(8, 18).length >= 4 ? formatted.slice(8, 18) : formatted.slice(0, 10);
        }

        setProducts(filtered);
      } catch (error) {
        console.error("Lỗi useProducts:", error);
        if (isMounted) setProducts(SAMPLE_PRODUCTS);
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
