"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { getPublicCategories, getCategories } from "@/services/categoryServices";

// Chuẩn hóa link ảnh để hiển thị ảnh từ backend
const getValidImageUrl = (img) => {
  if (!img || typeof img !== "string" || img.trim() === "") return "";
  const trimmed = img.trim();
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("/storage/")) return trimmed;

  // Lấy hostname hiện tại để ảnh luôn load đúng cổng backend 8000
  const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
  const storageMatch = trimmed.match(/\/storage\/(.+)$/);
  if (storageMatch) {
    return `http://${hostname}:8000/storage/${storageMatch[1]}`;
  }
  const cleanPath = trimmed.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `http://${hostname}:8000/storage/${cleanPath}`;
};

function CategoryThumb({ img, name }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [img]);

  const src = getValidImageUrl(img);

  if (!img || hasError || !src) {
    return (
      <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
        <ImageIcon className="w-8 h-8 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className="w-full h-full object-cover rounded-full group-hover/item:scale-105 transition-transform duration-200"
    />
  );
}

export default function CategorySlider() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchApiCategories = async () => {
      try {
        setLoading(true);
        // 1. Gọi API công khai danh mục thật từ SQL database
        let list = await getPublicCategories();

        // 2. Nếu danh sách rỗng, thử gọi API getCategories
        if (!Array.isArray(list) || list.length === 0) {
          const res = await getCategories();
          if (Array.isArray(res)) list = res;
          else if (Array.isArray(res?.data?.data)) list = res.data.data;
          else if (Array.isArray(res?.data)) list = res.data;
          else if (Array.isArray(res?.categories)) list = res.categories;
        }

        if (!isMounted) return;

        if (Array.isArray(list) && list.length > 0) {
          const merged = list.map((c, idx) => ({
            id: c.id || idx + 1,
            name: c.name || c.title || "Danh mục",
            slug: c.slug || `danh-muc-${c.id || idx}`,
            image: c.image || null,
          }));
          setCategories(merged);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Lỗi lấy danh mục từ SQL:", err);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchApiCategories();

    return () => {
      isMounted = false;
    };
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
        {loading ? (
          <div className="flex items-start gap-6 sm:gap-8 md:gap-10 min-w-max mx-auto animate-pulse">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center flex-shrink-0 w-28 sm:w-32 md:w-36 text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-100 border-2 border-gray-100 p-1 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gray-200" />
                </div>
                <div className="h-3.5 bg-gray-200 rounded-md w-20 mt-3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-6 sm:gap-8 md:gap-10 min-w-max mx-auto">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id || idx}
                href={cat.slug ? `/products?category=${encodeURIComponent(cat.slug)}` : `/products?q=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center flex-shrink-0 group/item cursor-pointer w-28 sm:w-32 md:w-36 text-center"
              >
                {/* Vòng tròn ảnh to, viền đơn giản thanh lịch (không màu mè) */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-gray-200 hover:border-[#f68b1f] shadow-xs hover:shadow-md transition-all duration-200 p-1 bg-white flex items-center justify-center overflow-hidden">
                  <CategoryThumb img={cat.image} name={cat.name} />
                </div>

                {/* Tên danh mục to rõ, đều chữ */}
                <span className="text-xs sm:text-[13px] font-bold text-gray-800 text-center uppercase tracking-tight group-hover/item:text-[#f68b1f] transition-colors mt-3 max-w-[120px] line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
