"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles, PhoneCall } from "lucide-react";

export default function Banner() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [topic, setTopic] = useState("Hoa sinh nhật");
  const [priceRange, setPriceRange] = useState("all");

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

  const handleFilterSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?topic=${encodeURIComponent(topic)}&price=${priceRange}`);
  };

  return (
    <div className="w-full mb-6">
      {/* KHỐI BANNER CHÍNH */}
      <div className="relative w-full rounded-sm overflow-hidden bg-linear-to-r from-[#e3f4ff] via-[#ebf7ff] to-[#f5fbff] border border-blue-100 shadow-xs min-h-[220px] sm:min-h-[260px] md:min-h-[300px] flex items-center">
        
        {/* NỀN HỌA TIẾT ĐỒNG QUÊ & NÔNG DÂN VIỆT NAM (STYLED VECTOR & ILLUSTRATION) */}
        <div className="absolute inset-0 z-0 flex items-center justify-between pointer-events-none select-none overflow-hidden">
          {/* Cảnh đồi núi mây trời background */}
          <div className="absolute inset-0 bg-linear-to-b from-[#bde2fc]/40 via-transparent to-[#cce8a8]/30" />
          
          {/* Cụm hình ảnh bên trái: Bác nông dân & thông điệp */}
          <div className="relative z-1 flex items-center h-full pl-4 sm:pl-8 lg:pl-12 w-full lg:w-3/5">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Bác nông dân avatar/chibi với nón lá và ôm hoa */}
              <div className="relative flex-shrink-0 flex flex-col items-center">
                <div className="relative w-28 sm:w-36 md:w-44 flex flex-col items-center">
                  {/* Nón lá SVG */}
                  <div className="w-24 sm:w-32 h-12 bg-linear-to-b from-[#e2a85c] to-[#c68233] [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rounded-t-sm shadow-xs mb-[-6px] z-10 flex items-end justify-center pb-1">
                    <div className="w-full h-0.5 bg-amber-800/30" />
                  </div>
                  {/* Khuôn mặt bác nông dân */}
                  <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-[#fde0c5] border-2 border-[#e6a87c] flex flex-col items-center justify-center relative shadow-xs">
                    {/* Mắt cười & râu */}
                    <div className="flex gap-3 text-xs font-bold text-gray-700 mt-2">
                      <span>^</span>
                      <span>^</span>
                    </div>
                    <div className="w-4 h-2 rounded-b-full bg-rose-400 mt-1" />
                    <div className="text-[10px] text-gray-400 font-serif">‿‿</div>
                  </div>
                  {/* Bó hoa hồng đỏ trên tay */}
                  <div className="relative -mt-3 z-10 px-3 py-1.5 bg-rose-600 text-white text-[11px] font-bold rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                    <span>💐</span>
                    <span className="text-[10px]">Hoa Việt Nam</span>
                  </div>
                  {/* Ruy băng "Cảm Ơn Vì Đã Chọn Chúng Tôi" */}
                  <div className="mt-2 bg-[#d32f2f] text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-sm shadow-sm text-center uppercase tracking-tight">
                    <span className="italic font-serif block text-[8px] sm:text-[9px] normal-case">~ Cảm Ơn ~</span>
                    VÌ ĐÃ CHỌN CHÚNG TÔI
                  </div>
                </div>
              </div>

              {/* Chữ Slogan & Khối BẠN CÓ BIẾT */}
              <div className="space-y-2 max-w-xs sm:max-w-sm">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#d87a16] font-serif italic drop-shadow-xs tracking-tight leading-none">
                    Đồng Hành
                  </h2>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#d87a16] font-serif tracking-tight leading-tight">
                    Cùng Nông Dân Việt Nam
                  </h3>
                </div>

                <div className="bg-white/85 backdrop-blur-xs p-2.5 sm:p-3 rounded-md border border-amber-200/60 shadow-2xs text-gray-700 text-[10px] sm:text-xs leading-relaxed space-y-1">
                  <div className="font-extrabold text-gray-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#d87a16]" />
                    <span>BẠN CÓ BIẾT?</span>
                  </div>
                  <p>
                    Sứ mệnh của <strong>Hoa Yêu Thương</strong> thành lập ra để phát triển hoa Việt Nam.
                  </p>
                  <p className="text-gray-600">
                    <strong>99%</strong> hoa được sử dụng đều là hoa Việt Nam cung cấp từ mọi miền Tổ Quốc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HỘP "TƯ VẤN CHỌN HOA TƯƠI" MÀU ĐỎ ĐÔ / HỒNG ĐẬM (PHÍA BÊN PHẢI) */}
        <div className="relative z-10 ml-auto mr-4 sm:mr-8 lg:mr-10 my-4 w-full max-w-[340px] sm:max-w-[400px]">
          <div className="bg-[#c2185b] rounded-sm p-3.5 sm:p-4 text-white shadow-lg border-2 border-rose-400/40">
            {/* Tiêu đề Box */}
            <h3 className="text-center text-sm sm:text-base font-bold uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <span>TƯ VẤN CHỌN HOA TƯƠI</span>
            </h3>

            {/* Form chọn nhanh */}
            <form onSubmit={handleFilterSearch} className="space-y-3">
              <div className="grid grid-cols-12 gap-2 items-end">
                {/* Chọn Chủ đề */}
                <div className="col-span-5 space-y-1">
                  <label className="block text-[11px] font-medium text-rose-100">
                    Chủ đề
                  </label>
                  <div className="relative">
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-white text-gray-800 text-xs py-1.5 pl-2 pr-6 rounded-xs appearance-none focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
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

                {/* Chọn Mức giá */}
                <div className="col-span-4 space-y-1">
                  <label className="block text-[11px] font-medium text-rose-100">
                    Mức giá
                  </label>
                  <div className="relative">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full bg-white text-gray-800 text-xs py-1.5 pl-2 pr-6 rounded-xs appearance-none focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
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

                {/* Nút Tìm kiếm */}
                <div className="col-span-3">
                  <button
                    type="submit"
                    className="w-full bg-[#f68b1f] hover:bg-[#e07a16] text-white text-xs font-bold py-1.5 px-2 rounded-xs transition-colors shadow-xs"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>

              {/* Dòng ghi chú hotline */}
              <p className="text-[10.5px] sm:text-[11px] text-rose-100 leading-snug pt-1">
                *Bạn có thể gọi nhanh cho chúng tôi theo số{" "}
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

        {/* NÚT CHẤM CHUYỂN SLIDE (GÓC DƯỚI BÊN PHẢI) */}
        <div className="absolute bottom-2.5 right-4 z-10 flex items-center gap-1.5 bg-white/60 backdrop-blur-xs px-2 py-1 rounded-full">
          {[0, 1, 2, 3].map((dot) => (
            <button
              key={dot}
              type="button"
              onClick={() => setActiveSlide(dot)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeSlide === dot ? "bg-[#d32f2f] w-3 h-3" : "bg-gray-400 hover:bg-gray-600"
              }`}
              aria-label={`Go to slide ${dot + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
