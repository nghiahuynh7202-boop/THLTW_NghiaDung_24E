"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/services/productServices";
import { formatProduct } from "@/lib/product";

export default function RelatedProducts({ currentProductId, categoryId, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!categoryId) return;
      try {
        setLoading(true);
        // Gọi SQL lấy đúng các sản phẩm cùng category_id, loại bỏ sản phẩm đang xem
        const res = await getProducts({
          category_id: categoryId,
          exclude_id: currentProductId,
          per_page: 5,
        });

        const list = Array.isArray(res) ? res : res?.data || [];
        setProducts(list.map(formatProduct));
      } catch (error) {
        console.error("Lỗi tải sản phẩm liên quan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [currentProductId, categoryId]);

  // Nếu không có sản phẩm nào cùng danh mục thì không hiển thị
  if (!loading && products.length === 0) return null;

  return (
    <div className="mt-10 space-y-4">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <h2 className="text-[#222222] text-base sm:text-lg font-bold uppercase tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-[#e91e63] rounded-full inline-block" />
          SẢN PHẨM LIÊN QUAN
        </h2>
      </div>

      {/* Hiệu ứng loading */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3"
            >
              <div className="w-full aspect-[4/4.8] bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded-md w-3/4" />
              <div className="h-4 bg-gray-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        /* Danh sách sản phẩm cùng danh mục từ SQL */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
