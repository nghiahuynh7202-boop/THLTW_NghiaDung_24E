"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Zap, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCountdown } from "@/hooks/useCountdown";

/**
 * COMPONENT: Flash Sale Giờ Vàng (Dạng Slider 1 Hàng Có Mũi Tên 2 Bên)
 * - Nền trắng sạch sẽ hài hòa với shop hoa, thanh tiêu đề màu đỏ cam rực rỡ
 * - Hiển thị toàn bộ sản phẩm khuyến mãi trên 1 hàng duy nhất, bấm nút mũi tên trái/phải để lướt
 */
export default function FlashSale({ onAddToCart }) {
  // 1. Đồng hồ đếm ngược và dữ liệu sản phẩm giảm giá từ CSDL MySQL
  const time = useCountdown(2, 59, 45);
  const { products, loading } = useProducts({ category: "flash-sale" });

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Kiểm tra vị trí thanh cuộn để bật/tắt hiệu ứng cho 2 nút mũi tên
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
      setHasOverflow(scrollWidth > clientWidth + 5);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 200);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products, loading, checkScroll]);

  // Cuộn sang trái hoặc phải khi nhấn nút mũi tên
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      // Cuộn theo khoảng 75% chiều rộng khung nhìn (tương đương 3 sản phẩm trên màn hình lớn)
      const scrollAmount = Math.max(260, container.clientWidth * 0.75);
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  const showControls = hasOverflow || products.length > 4;

  return (
    <section className="bg-white rounded-2xl border-2 border-[#f68b1f]/40 shadow-sm p-4 sm:p-5 font-sans relative">
      {/* 1. THANH HEADER GRADIENT NỔI BẬT: Tiêu đề + Đồng hồ + Xem tất cả */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-[#f68b1f] text-white rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 mb-5 shadow-xs">
        {/* Tiêu đề & Icon tia sét / lửa */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-red-600 shadow-xs animate-bounce">
              <Zap className="w-4 h-4 fill-current text-amber-500" />
            </span>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              GIỜ VÀNG GIÁ SỐC
            </h2>
          </div>

          {/* Đồng hồ đếm ngược */}
          <div className="flex items-center gap-1.5 text-xs bg-black/25 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
            <span className="text-white/90 text-[11px] font-medium hidden sm:inline">
              Kết thúc sau:
            </span>
            {time.map((num, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="font-bold text-yellow-300">:</span>}
                <span className="bg-white text-red-600 font-mono font-black px-1.5 py-0.5 rounded text-xs shadow-2xs">
                  {String(num).padStart(2, "0")}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Nút Xem tất cả màu vàng nổi bật */}
        <Link
          href="/products?sale=1"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-yellow-200 hover:text-white transition-colors group"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 2. DANH SÁCH SẢN PHẨM: 1 HÀNG DUY NHẤT VỚI MŨI TÊN 2 BÊN */}
      {loading ? (
        <div className="flex gap-4 sm:gap-5 overflow-hidden animate-pulse py-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] bg-gray-50 rounded-xl p-3 h-80 border border-gray-100"
            />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="relative group/flashsale">
          {/* NÚT MŨI TÊN BÊN TRÁI */}
          {showControls && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Xem sản phẩm khuyến mãi trước"
              className={`absolute -left-2 sm:-left-3.5 top-[38%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "text-gray-700 hover:text-white hover:bg-red-600 hover:border-red-600 cursor-pointer active:scale-95 hover:shadow-lg"
                  : "text-gray-300 opacity-40 cursor-not-allowed pointer-events-none"
              }`}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          )}

          {/* NÚT MŨI TÊN BÊN PHẢI */}
          {showControls && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Xem sản phẩm khuyến mãi tiếp theo"
              className={`absolute -right-2 sm:-right-3.5 top-[38%] -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "text-gray-700 hover:text-white hover:bg-red-600 hover:border-red-600 cursor-pointer active:scale-95 hover:shadow-lg"
                  : "text-gray-300 opacity-40 cursor-not-allowed pointer-events-none"
              }`}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          )}

          {/* KHUNG CUỘN 1 HÀNG DUY NHẤT */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scroll-smooth py-1 px-0.5 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] snap-start flex flex-col justify-between"
              >
                <div className="w-full max-w-[260px] mx-auto flex flex-col h-full justify-between">
                  <ProductCard
                    product={item}
                    onAddToCart={onAddToCart}
                  />

                  {/* HIỆU ỨNG SALE: Thanh tiến độ lửa ĐANG BÁN CHẠY */}
                  <div className="mt-2.5 px-0.5">
                    <div className="w-full bg-red-100 rounded-full h-4 overflow-hidden relative shadow-inner">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(40, ((item.id * 23) % 50) + 45)
                          )}%`,
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider drop-shadow-xs">
                        🔥 ĐANG BÁN CHẠY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-xs">
          Hiện chưa có sản phẩm Flash Sale nào trong cơ sở dữ liệu.
        </div>
      )}
    </section>
  );
}
