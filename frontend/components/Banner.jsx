"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, PhoneCall, Image as ImageIcon } from "lucide-react";
import { getPublicBanners } from "@/services/bannerServices";

// Xử lý link ảnh từ backend Laravel
const resolveImgUrl = (rawImg) => {
  const raw = rawImg ? String(rawImg).trim() : "";
  if (!raw) return "";
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:") ||
    raw.startsWith("/images/")
  ) {
    return raw;
  }
  const hostname =
    typeof window !== "undefined"
      ? window.location.hostname || "127.0.0.1"
      : "127.0.0.1";
  const clean = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `http://${hostname}:8000/storage/${clean}`;
};

function BannerSlideImage({ banner }) {
  const [hasError, setHasError] = useState(false);
  const src = resolveImgUrl(banner?.image);

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <ImageIcon className="w-12 h-12 mb-2 text-gray-300" />
        <p className="text-sm font-semibold">Chưa có ảnh banner.</p>
      </div>
    );
  }

  return (
    <img
      key={banner.id}
      src={src}
      alt="Banner"
      className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out animate-in fade-in"
      onError={() => setHasError(true)}
    />
  );
}

export default function Banner() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [topic, setTopic] = useState("Hoa sinh nhật");
  const [priceRange, setPriceRange] = useState("all");

  // Lấy toàn bộ banner trực tiếp từ Backend API (Không dùng dữ liệu mặc định)
  useEffect(() => {
    async function loadBanners() {
      try {
        const data = await getPublicBanners();
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách banner:", err);
      }
    }
    loadBanners();
  }, []);

  // Tự động chuyển slide liên tục mỗi 3.5 giây khi có từ 2 banner trở lên
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [banners.length]);

  const topics = [
    "Hoa sinh nhật",
    "Hoa khai trương",
    "Hoa chúc mừng",
    "Hoa tình yêu",
    "Hoa cảm ơn",
    "Hoa cưới",
    "Hoa chia buồn",
    "Lan hồ điệp",
    "Giỏ trái cây",
  ];

  const priceRanges = [
    { label: "Tất cả", value: "all" },
    { label: "Dưới 300.000đ", value: "0-300000" },
    { label: "300.000đ - 500.000đ", value: "300000-500000" },
    { label: "500.000đ - 1.000.000đ", value: "500000-1000000" },
    { label: "Trên 1.000.000đ", value: "1000000-max" },
  ];

  const handleFilterSearch = (e) => {
    e.preventDefault();
    router.push(
      `/products?topic=${encodeURIComponent(topic)}&price=${priceRange}`,
    );
  };

  const currentBanner = banners[activeSlide] || banners[0];

  return (
    <div className="w-full mb-6 font-sans">
      {/* KHỐI BANNER CHÍNH */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm min-h-[260px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[430px] flex items-center bg-gray-100">
        {/* NỀN SLIDE NỘI DUNG: CHỈ DÙNG ẢNH TỪ API BACKEND */}
        <div className="absolute inset-0 z-0">
          {banners.length > 0 && currentBanner ? (
            <div className="w-full h-full relative">
              <Link
                href={currentBanner.link || "/products"}
                className="block w-full h-full"
              >
                <BannerSlideImage banner={currentBanner} />
              </Link>
            </div>
          ) : (
            /* Nếu chưa có ảnh trong database */
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <ImageIcon className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-sm font-semibold">
                Chưa có banner nào từ hệ thống.
              </p>
              <Link
                href="/admin/banners"
                className="text-xs text-[#f68b1f] hover:underline mt-1 font-bold"
              >
                Bấm vào đây để tải ảnh banner lên Admin
              </Link>
            </div>
          )}
        </div>

        {/* HỘP "TƯ VẤN CHỌN HOA TƯƠI" MÀU ĐỎ ĐÔ / HỒNG ĐẬM (PHÍA BÊN PHẢI) */}
        <div className="relative z-10 ml-auto mr-4 sm:mr-8 lg:mr-10 my-4 w-full max-w-[340px] sm:max-w-[400px]">
          <div className="bg-[#c2185b]/95 backdrop-blur-xs rounded-lg p-3.5 sm:p-4 text-white shadow-xl border-2 border-rose-400/40">
            <h3 className="text-center text-sm sm:text-base font-bold uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <span>TƯ VẤN CHỌN HOA TƯƠI</span>
            </h3>

            <form onSubmit={handleFilterSearch} className="space-y-3">
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1">
                  <label className="block text-[11px] font-medium text-rose-100">
                    Chủ đề
                  </label>
                  <div className="relative">
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-white text-gray-800 text-xs py-1.5 pl-2 pr-6 rounded appearance-none focus:outline-none font-medium"
                    >
                      {topics.map((t, idx) => (
                        <option key={idx} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="col-span-4 space-y-1">
                  <label className="block text-[11px] font-medium text-rose-100">
                    Mức giá
                  </label>
                  <div className="relative">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full bg-white text-gray-800 text-xs py-1.5 pl-2 pr-6 rounded appearance-none focus:outline-none font-medium"
                    >
                      {priceRanges.map((p, idx) => (
                        <option key={idx} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="col-span-3">
                  <button
                    type="submit"
                    className="w-full bg-[#f68b1f] hover:bg-[#e07a16] text-white text-xs font-bold py-1.5 px-2 rounded transition-colors shadow-xs cursor-pointer"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>

              <p className="text-[10.5px] sm:text-[11px] text-rose-100 leading-snug pt-1">
                *Bạn có thể gọi nhanh theo số{" "}
                <a
                  href="tel:18006353"
                  className="font-bold text-amber-300 hover:underline inline-flex items-center gap-0.5"
                >
                  <PhoneCall className="w-3 h-3 inline" /> 1800 6353
                </a>{" "}
                để đặt hoa theo thiết kế riêng
              </p>
            </form>
          </div>
        </div>

        {/* NÚT CHẤM CHUYỂN SLIDE (CHỈ HIỆN KHI CÓ TỪ 2 BANNER TỪ API TRỞ LÊN) */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs">
            {banners.map((_, dot) => (
              <button
                key={dot}
                type="button"
                onClick={() => setActiveSlide(dot)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === dot
                    ? "bg-[#d32f2f] w-4 h-2"
                    : "bg-gray-400 hover:bg-gray-600 w-2 h-2"
                }`}
                aria-label={`Chuyển tới slide ${dot + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
