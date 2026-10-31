"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Flame, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import TagList from "./Taglist";
import { useProducts } from "@/hooks/useProducts";
import { useCountdown } from "@/hooks/useCountdown";

const ALL = { label: "Tất cả" };

const FLASH_TAGS = [
  ALL,
  { label: "Bó hoa tươi", value: "bo-hoa" },
  { label: "Hộp hoa tươi", value: "hop-hoa" },
  { label: "Lẵng hoa", value: "lang-hoa" },
  { label: "Hot Deal", value: "hot-deal" },
];

const arrowClass =
  "absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-red-600 shadow-xl border border-red-200 hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-500 hover:text-white hover:border-transparent transition-all flex items-center justify-center cursor-pointer active:scale-95";

const timeBox = "bg-gradient-to-b from-red-600 to-orange-600 text-white font-mono px-2 py-0.5 rounded-md font-black";

export default function FlashSale({ onAddToCart }) {
  const [activeTag, setActiveTag] = useState(ALL);
  const listRef = useRef(null);
  const time = useCountdown();
  const { products, loading } = useProducts({ category: "flash-sale", tag: activeTag.value });

  const scroll = (dir) => listRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <div className="bg-[#fff8f5] p-4 sm:p-6 rounded-3xl border-2 border-[#ff3b30] shadow-lg shadow-red-500/10 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 pb-3 border-b border-red-200/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Badge lửa */}
          <div className="relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-[#e50914] via-[#f84300] to-[#ff6600] text-white px-4 py-1.5 rounded-full shadow-md shadow-orange-500/30 uppercase tracking-wider">
            <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center w-5 h-5 animate-flame">
              <Flame className="w-5 h-5 text-amber-200 fill-[#ffcc00]" />
              <Flame className="w-3.5 h-3.5 text-[#ff2200] fill-[#ff3b00] absolute -bottom-0.5" />
            </div>
            <span className="relative z-10 font-black text-sm tracking-wide">FLASH SALE</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-1.5">
            <span className="text-[#e50914]">GIỜ</span>
            <span className="text-[#ff5a00]">VÀNG GIÁ SỐC</span>
          </h2>

          {/* Đồng hồ đếm ngược */}
          <div className="flex items-center gap-1.5 text-xs font-bold sm:ml-2 bg-white/95 px-3 py-1 rounded-full border border-red-300">
            <span className="text-[11px] text-gray-500 font-medium">Kết thúc trong:</span>
            {time.map((n, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-red-500">:</span>}
                <span className={timeBox}>{String(n).padStart(2, "0")}</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {loading ? (
        <div className="flex items-stretch gap-3.5 sm:gap-4 overflow-hidden py-2 px-1 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[195px] sm:w-[225px] lg:w-[235px] flex-shrink-0 bg-white rounded-2xl border border-red-100 p-3 space-y-3">
              <div className="w-full aspect-[4/4.8] bg-red-50/60 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded-md w-3/4" />
              <div className="h-4 bg-red-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="relative">
          <button type="button" aria-label="Xem sản phẩm trước" onClick={() => scroll(-1)} className={`${arrowClass} -left-2 sm:-left-3`}>
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div ref={listRef} className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth no-scrollbar py-2 px-1">
            {products.map((item) => (
              <div key={item.id} className="w-[195px] sm:w-[225px] lg:w-[235px] flex-shrink-0">
                <ProductCard product={item} onAddToCart={onAddToCart} />
              </div>
            ))}
          </div>

          <button type="button" aria-label="Xem sản phẩm tiếp" onClick={() => scroll(1)} className={`${arrowClass} -right-2 sm:-right-3`}>
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-xs">
          Hiện chưa có sản phẩm Flash Sale nào.
        </div>
      )}

      <div className="mt-5 mb-1 flex justify-center">
        <Link
          href="/category/flash-sale"
          className="inline-flex items-center justify-center px-8 py-2.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-700 hover:to-orange-600 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-md shadow-md shadow-red-500/25 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          XEM TẤT CẢ FLASH SALE
        </Link>
      </div>
    </div>
  );
}