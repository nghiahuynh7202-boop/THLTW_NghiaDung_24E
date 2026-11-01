"use client";

import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCountdown } from "@/hooks/useCountdown";

/**
 * COMPONENT: Flash Sale Giờ Vàng (Kiểu Header Banner Rực Rỡ & Thân Trắng Tinh Tế)
 * - Nền trắng sạch sẽ hài hòa với shop hoa, thanh tiêu đề màu đỏ cam rực rỡ
 * - Code siêu ngắn gọn (~65 dòng), dễ hiểu cho sinh viên làm báo cáo
 */
export default function FlashSale({ onAddToCart }) {
  // 1. Đồng hồ đếm ngược và dữ liệu sản phẩm giảm giá từ CSDL MySQL
  const time = useCountdown(2, 59, 45);
  const { products, loading } = useProducts({ category: "flash-sale" });

  return (
    <section className="bg-white rounded-2xl border-2 border-[#f68b1f]/40 shadow-sm p-4 sm:p-5 font-sans">
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

      {/* 2. DANH SÁCH SẢN PHẨM: 4 cột rộng rãi hơn 1 chút xíu, đều và cân đối */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-3 h-80 border border-gray-100"
            />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((item) => (
            <div key={item.id} className="flex flex-col w-full max-w-[260px] mx-auto">
              <ProductCard
                product={item}
                onAddToCart={onAddToCart}
              />

              {/* HIỆU ỨNG SALE: Thanh tiến độ lửa ĐANG BÁN CHẠY */}
              <div className="mt-2.5 px-0.5">
                <div className="w-full bg-red-100 rounded-full h-4 overflow-hidden relative shadow-inner">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(40, ((item.id * 23) % 50) + 45))}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-wider drop-shadow-xs">
                    🔥 ĐANG BÁN CHẠY
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-xs">
          Hiện chưa có sản phẩm Flash Sale nào trong cơ sở dữ liệu.
        </div>
      )}
    </section>
  );
}
