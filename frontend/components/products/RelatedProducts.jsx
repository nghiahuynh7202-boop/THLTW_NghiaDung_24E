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
      // Nếu không có danh mục thì không tải
      if (!categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // BƯỚC 1: Gọi API lấy sản phẩm cùng category_id và loại trừ currentProductId
        const res = await getProducts({
          category_id: categoryId,
          exclude_id: currentProductId,
          per_page: 8,
        });

        const list = Array.isArray(res) ? res : res?.data || [];

        // BƯỚC 2: Lọc chắc chắn trên Frontend:
        // - Phải KHÁC sản phẩm đang xem (item.id != currentProductId)
        // - Phải CÙNG danh mục (item.category_id == categoryId)
        const filtered = list
          .filter((item) => {
            const isDifferent = String(item.id) !== String(currentProductId);
            const itemCatId = item.category_id || item.category?.id;
            const isSameCategory = String(itemCatId) === String(categoryId);
            return isDifferent && isSameCategory;
          })
          .slice(0, 4) // Lấy tối đa 4 sản phẩm vừa 1 hàng
          .map(formatProduct);

        setProducts(filtered);
      } catch (error) {
        console.error("Lỗi tải sản phẩm liên quan:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [currentProductId, categoryId]);

  // Nếu không có sản phẩm nào khác cùng danh mục thì ẩn khung
  if (!loading && products.length === 0) return null;

  return (
    <div className="mt-10 space-y-4">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <h2 className="text-[#222222] text-base sm:text-lg font-bold uppercase tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-[#f68b1f] rounded-full inline-block" />
          SẢN PHẨM LIÊN QUAN
        </h2>
      </div>

      {/* Hiệu ứng loading */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-3 space-y-3"
            >
              <div className="w-full aspect-[4/4.7] bg-gray-100 rounded-lg" />
              <div className="h-4 bg-gray-100 rounded-md w-3/4" />
              <div className="h-4 bg-gray-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        /* Danh sách sản phẩm cùng danh mục từ SQL */
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
