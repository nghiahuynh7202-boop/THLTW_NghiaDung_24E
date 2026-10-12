"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategories } from "@/services/categoryServices";

export default function CategorySlider() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Danh mục mặc định đẹp mắt khi chưa có dữ liệu hoặc backend trống
  const defaultCategories = [
    { id: 1, name: "HOA SINH NHẬT", slug: "hoa-sinh-nhat", image: "/images/hoa.jpg" },
    { id: 2, name: "HOA TÌNH YÊU", slug: "hoa-tinh-yeu", image: "/images/hoa.jpg" },
    { id: 3, name: "HOA KHAI TRƯƠNG", slug: "hoa-khai-truong", image: "/images/hoa.jpg" },
    { id: 4, name: "HOA TỐT NGHIỆP", slug: "hoa-tot-nghiep", image: "/images/hoa.jpg" },
    { id: 5, name: "HOA CHIA BUỒN", slug: "hoa-chia-buon", image: "/images/hoa.jpg" },
    { id: 6, name: "HOA THEO YÊU CẦU", slug: "hoa-theo-yeu-cau", image: "/images/hoa.jpg" },
    { id: 7, name: "LAN HỒ ĐIỆP", slug: "lan-ho-diep", image: "/images/hoa.jpg" },
    { id: 8, name: "BÓ HOA TƯƠI", slug: "bo-hoa-tuoi", image: "/images/hoa.jpg" },
  ];

  const [categories, setCategories] = useState(defaultCategories);

  // Chuẩn hóa link ảnh để không bao giờ bị lỗi icon ảnh vỡ
  const getValidImageUrl = (img) => {
    if (!img || typeof img !== "string" || img.trim() === "") return "/images/hoa.jpg";
    const trimmed = img.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("/")) return trimmed;
    return `/images/${trimmed}`;
  };

  useEffect(() => {
    const fetchApiCategories = async () => {
      try {
        const res = await getCategories();
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;
        else if (Array.isArray(res?.categories)) list = res.categories;

        if (list.length > 0) {
          const merged = list.map((c, idx) => ({
            id: c.id || idx + 1,
            name: c.name || c.title || "Danh mục",
            slug: c.slug || `danh-muc-${c.id || idx}`,
            image: c.image || "/images/hoa.jpg",
          }));
          setCategories(merged);
        }
      } catch {
        // Giữ defaultCategories nếu lỗi kết nối
      }
    };
    fetchApiCategories();
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollDistance = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollDistance : scrollDistance,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <div className="relative group w-full py-4 my-2 select-none">
      {/* Nút mũi tên trái: Rê chuột vào cụm danh mục mới hiện */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Lướt sang trái"
          className="absolute -left-2 sm:-left-3 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-white hover:bg-[#f68b1f] hover:border-[#f68b1f] transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Nút mũi tên phải: Rê chuột vào cụm danh mục mới hiện */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Lướt sang phải"
          className="absolute -right-2 sm:-right-3 top-[38%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-white hover:bg-[#f68b1f] hover:border-[#f68b1f] transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Dãy danh mục 1 hàng to tròn đều, code đơn giản, không màu mè */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-start gap-6 sm:gap-8 md:gap-10 overflow-x-auto scroll-smooth no-scrollbar py-2 px-2"
      >
        <div className="flex items-start gap-6 sm:gap-8 md:gap-10 min-w-max mx-auto">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id || idx}
              href={`/search?q=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center flex-shrink-0 group/item cursor-pointer w-28 sm:w-32 md:w-36 text-center"
            >
              {/* Vòng tròn ảnh to, viền đơn giản thanh lịch (không màu mè) */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-gray-200 hover:border-[#f68b1f] shadow-xs hover:shadow-md transition-all duration-200 p-1 bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={getValidImageUrl(cat.image)}
                  alt={cat.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/hoa.jpg";
                  }}
                  className="w-full h-full object-cover rounded-full group-hover/item:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Tên danh mục to rõ, đều chữ */}
              <span className="text-xs sm:text-[13px] font-bold text-gray-800 text-center uppercase tracking-tight group-hover/item:text-[#f68b1f] transition-colors mt-3 max-w-[120px] line-clamp-2 leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
