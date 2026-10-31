"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import TagList from "./Taglist";
import { useProducts } from "@/hooks/useProducts";

const ALL = { label: "Tất cả" };

// Một khung sản phẩm dạng lưới: tiêu đề + tag lọc + lưới + nút xem thêm
export default function ProductSection({ title, color, link, category, tags = [], onAddToCart }) {
  const [activeTag, setActiveTag] = useState(ALL);
  const { products, loading } = useProducts({ category, tag: activeTag?.value });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-2.5">
        <h2 className="text-[#222222] text-base sm:text-lg font-bold uppercase tracking-tight flex items-center gap-2">
          <span className={`w-1.5 h-4.5 ${color} rounded-full inline-block`} />
          {title}
        </h2>


      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3">
              <div className="w-full aspect-[4/4.8] bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded-md w-3/4" />
              <div className="h-4 bg-gray-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((item) => (
            <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-xs">
          Chưa có sản phẩm nào trong danh mục này.
        </div>
      )}

      <div className="mt-6 mb-2 flex justify-center">
        <Link
          href={link}
          className="inline-flex items-center justify-center px-8 py-2.5 bg-[#ff4081] hover:bg-[#e91e63] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
        >
          XEM THÊM
        </Link>
      </div>
    </div>
  );
}