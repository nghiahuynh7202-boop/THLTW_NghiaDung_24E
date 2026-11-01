"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getPublicPages } from "@/services/pageServices";
// SVG Icons cho mạng xã hội và tiện ích để không bị phụ thuộc phiên bản thư viện
function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function TwitterIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
    </svg>
  );
}
function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function LinkedinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}
function YoutubeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function HeartIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}
export default function Footer() {
  // 1. State cho nút Scroll To Top mũi tên đỏ (Góc phải)
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 2. State cho Chat CSKH và Popup Form (Góc trái)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTooltip, setChatTooltip] = useState(false);
  const [chatSubmitted, setChatSubmitted] = useState(false);
  const [chatForm, setChatForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (scrollY / docHeight) * 100),
        );
        setScrollProgress(progress);
      }
      setShowScrollTop(scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Tự động bung bong bóng chào sau 2.5 giây khi vào web
    const timer = setTimeout(() => {
      setChatTooltip(true);
    }, 2500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const [dynamicPages, setDynamicPages] = useState([]);

  // Tải danh sách trang tĩnh từ CSDL
  useEffect(() => {
    getPublicPages({ per_page: 50 })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDynamicPages(data);
        }
      })
      .catch((err) => console.error("Lỗi tải trang tĩnh footer:", err));
  }, []);

  const DEFAULT_CUSTOMER_CARE_LINKS = [
    { name: "Giới Thiệu", href: "/pages/gioi-thieu" },
    { name: "Liên Hệ", href: "/contact" },
    { name: "Chính Sách Đổi Trả", href: "/pages/chinh-sach-doi-tra" },
    { name: "Hướng Dẫn Mua Hàng", href: "/pages/huong-dan-mua-hang" },
    { name: "Chính Sách Vận Chuyển", href: "/pages/chinh-sach-van-chuyen" },
    { name: "Chính Sách Hoàn Tiền", href: "/pages/chinh-sach-hoan-tien" },
    { name: "Hình Thức Thanh Toán", href: "/pages/hinh-thuc-thanh-toan" },
    { name: "Bảo Mật Thông Tin", href: "/pages/bao-mat-thong-tin" },
    { name: "Câu Hỏi Thường Gặp", href: "/pages/cau-hoi-thuong-gap" },
  ];

  const customerCareLinks = useMemo(() => {
    if (dynamicPages.length > 0) {
      const pageLinks = dynamicPages.map((p) => ({
        name: p.title,
        href: `/pages/${p.slug}`,
      }));
      return [
        { name: "Liên Hệ", href: "/contact" },
        ...pageLinks,
      ];
    }
    return DEFAULT_CUSTOMER_CARE_LINKS;
  }, [dynamicPages]);
  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com",
      icon: FacebookIcon,
      color: "hover:text-[#1877f2]",
    },
    {
      name: "Twitter",
      href: "https://twitter.com",
      icon: TwitterIcon,
      color: "hover:text-[#1da1f2]",
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: InstagramIcon,
      color: "hover:text-[#e4405f]",
    },
    {
      name: "Linkedin",
      href: "https://linkedin.com",
      icon: LinkedinIcon,
      color: "hover:text-[#0a66c2]",
    },
    {
      name: "Youtube",
      href: "https://youtube.com",
      icon: YoutubeIcon,
      color: "hover:text-[#ff0000]",
    },
  ];
  return (
    <footer className="w-full bg-white border-t border-gray-200 text-gray-700 text-xs font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* CỘT 1: LOGO, LIÊN HỆ, QR CODE, BỘ CÔNG THƯƠNG */}
          <div className="space-y-4">
            {/* Logo */}
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-[#d81b60] flex items-center justify-center text-[#d81b60]">
                  <HeartIcon className="w-5 h-5 text-[#d81b60]" />
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-[#d81b60]">
                    FLOWERCORNER
                  </div>
                  <div className="text-[11px] italic text-[#d81b60] font-serif">
                    Say it with flowers
                  </div>
                </div>
              </div>
            </Link>

            {/* Hotline & Email */}
            <div className="space-y-1 text-gray-600 text-xs">
              <p>
                <span className="font-semibold text-gray-800">Hotline:</span>{" "}
                <a
                  href="tel:1900633045"
                  className="hover:text-[#d81b60] font-medium"
                >
                  1900633045
                </a>{" "}
                -{" "}
                <a
                  href="tel:0865160360"
                  className="hover:text-[#d81b60] font-medium"
                >
                  0865160360
                </a>
              </p>
              <p>
                <span className="font-semibold text-gray-800">Email:</span>{" "}
                <a
                  href="mailto:sales@flowercorner.vn"
                  className="hover:text-[#d81b60] font-medium"
                >
                  sales@flowercorner.vn
                </a>
              </p>
            </div>

            {/* Badge Đã Thông Báo Bộ Công Thương */}
            <div className="pt-2">
              <Image
                src="/images/da-thong-bao.png"
                alt="Đã Thông Báo Bộ Công Thương"
                width={150}
                height={56}
                className="h-11 w-auto object-contain hover:opacity-95 transition-opacity"
              />
            </div>
          </div>

          {/* CỘT 2: CHĂM SÓC KHÁCH HÀNG */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              CHĂM SÓC KHÁCH HÀNG
            </h3>
            <ul className="space-y-2 text-xs">
              {customerCareLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-[#d81b60] transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: THEO DÕI */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              THEO DÕI
            </h3>
            <ul className="space-y-2.5 text-xs">
              {socialLinks.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <li key={idx}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 text-gray-600 ${item.color} transition-colors font-medium`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{item.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CỘT 4: SHOP HOA FLOWERCORNER - ĐỊA CHỈ & PHÁP LÝ */}
          <div className="space-y-3 text-xs text-gray-600">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              SHOP HOA FLOWERCORNER
            </h3>

            <div>
              <span className="font-bold text-gray-800 block">
                Cửa hàng chính:
              </span>
              <span>142 Nguyễn Văn Cừ, Phường Cầu Ông Lãnh, TP.HCM</span>
            </div>

            <div>
              <span className="font-bold text-gray-800 block">
                Cửa Hàng TP.HCM:
              </span>
              <span>225/3 Nguyễn Đình Chiểu, Phường Bàn Cờ, TP.HCM</span>
            </div>

            <div>
              <span className="font-bold text-gray-800 block">CN Hà Nội:</span>
              <span>34B Lý Nam Đế, Hoàn Kiếm, Hà Nội</span>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-900 block uppercase">
                CÔNG TY TNHH FLOWER CORNER
              </span>
              <span className="text-gray-500">Mã số thuế: 0319117387</span>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} FlowerCorner. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Thiết kế & phát triển cho hệ thống shop hoa tươi cao cấp
          </p>
        </div>
      </div>
      {/* =========================================================================
          1. NÚT MŨI TÊN LƯỚT LÊN ĐẦU TRANG CÓ VÒNG TIẾN TRÌNH ĐỎ (GÓC PHẢI - ẢNH 2)
      ========================================================================= */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Cuộn lên đầu trang"
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${
          showScrollTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Vòng tròn tiến trình SVG theo tỷ lệ cuộn trang */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
          viewBox="0 0 44 44"
        >
          <circle
            cx="22"
            cy="22"
            r="19"
            className="text-gray-100 stroke-current"
            strokeWidth="2.5"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r="19"
            className="text-[#ea580c] stroke-current transition-all duration-100"
            strokeWidth="2.5"
            strokeDasharray={119.38}
            strokeDashoffset={119.38 - (scrollProgress / 100) * 119.38}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Icon mũi tên đỏ chỉ lên trên chuẩn như Ảnh 2 */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-[#ea580c] fill-none stroke-current stroke-[2.5] relative z-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 19V5m0 0l-6 6m6-6l6 6"
          />
        </svg>
      </button>

      {/* =========================================================================
          2. NÚT CHAT CSKH + BONG BÓNG CHÀO + FORM TƯ VẤN (GÓC TRÁI - ẢNH 1 & ẢNH 3)
      ========================================================================= */}
      <div className="fixed bottom-6 left-6 z-50 font-sans select-none">
        {/* Khi chưa mở form: Nút tròn xanh lá + Bong bóng lời chào */}
        {!chatOpen && (
          <div className="relative flex items-center">
            {/* Nút tròn xanh lá có hiệu ứng sóng rung rinh */}
            <button
              type="button"
              onClick={() => {
                setChatOpen(true);
                setChatTooltip(false);
              }}
              aria-label="Tư vấn trực tuyến"
              className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#22c55e] text-white flex items-center justify-center shadow-xl hover:bg-[#16a34a] hover:scale-108 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {/* Hiệu ứng sóng lan tỏa */}
              <span className="absolute inset-0 rounded-full bg-[#22c55e] animate-ping opacity-35 pointer-events-none" />
              <span className="absolute -inset-1 rounded-full bg-green-400/30 animate-pulse pointer-events-none" />

              {/* Icon 3 chấm tròn trắng chuẩn như Ảnh 1 */}
              <div className="relative z-10 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 sm:w-8 sm:h-8 fill-white transition-transform group-hover:scale-110"
                >
                  <path d="M12 2C6.477 2 2 6.141 2 11.25c0 2.87 1.433 5.433 3.69 7.094L4.5 22l4.188-1.396C9.742 20.854 10.846 21 12 21c5.523 0 10-4.141 10-9.25S17.523 2 12 2z" />
                  <circle cx="8" cy="11.5" r="1.3" className="fill-[#22c55e]" />
                  <circle
                    cx="12"
                    cy="11.5"
                    r="1.3"
                    className="fill-[#22c55e]"
                  />
                  <circle
                    cx="16"
                    cy="11.5"
                    r="1.3"
                    className="fill-[#22c55e]"
                  />
                </svg>
              </div>
            </button>

            {/* Bong bóng lời chào bên cạnh nút (Chuẩn theo Ảnh 1) */}
            {chatTooltip && (
              <div className="absolute left-[70px] sm:left-[80px] bottom-0 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 transition-all duration-300">
                {/* Mũi tên nhọn chỉ sang trái về nút xanh */}
                <div className="absolute -left-2 bottom-5 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-white" />

                {/* Header bong bóng lời chào */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center font-bold text-xs bg-red-50">
                      🏠
                    </div>
                    <h4 className="text-xs sm:text-[13px] font-bold text-gray-800">
                      Hoa Yêu Thương - CSKH
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatTooltip(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors text-sm"
                    title="Đóng thông báo"
                  >
                    ✕
                  </button>
                </div>

                {/* Lời nhắn chào khách */}
                <div
                  onClick={() => {
                    setChatOpen(true);
                    setChatTooltip(false);
                  }}
                  className="mt-2.5 text-xs sm:text-[13px] text-gray-700 space-y-1 cursor-pointer hover:text-green-700 transition-colors"
                >
                  <p className="font-semibold text-gray-900">
                    Hoa Yêu Thương xin chào!
                  </p>
                  <p>Em có thể giúp gì cho anh chị?</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Khi bấm mở: Cửa sổ Popup Form tư vấn CSKH (Chuẩn theo Ảnh 3) */}
        {chatOpen && (
          <div className="w-[330px] sm:w-[370px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300">
            {/* Header màu xanh lá */}
            <div className="bg-[#22c55e] text-white p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {/* Icon tròn đỏ HYT */}
                  <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white/80 flex items-center justify-center text-white font-black text-xs shadow-xs">
                    HYT
                  </div>
                  <h3 className="font-bold text-sm sm:text-base tracking-tight">
                    Hoa Yêu Thương - CSKH
                  </h3>
                </div>
                {/* Nút đóng ✕ */}
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-lg leading-none"
                  title="Đóng cửa sổ"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-white/95 leading-relaxed font-normal">
                Chúng tôi sẵn sàng trợ giúp. Bạn vui lòng để lại thông tin hoặc
                điện thoại{" "}
                <a
                  href="tel:02873002010"
                  className="underline font-bold hover:text-yellow-200"
                >
                  028 73002010
                </a>
                .
              </p>
            </div>

            {/* Thân Form theo đúng Ảnh 3 */}
            <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto">
              {!chatSubmitted ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      !chatForm.name.trim() ||
                      !chatForm.phone.trim() ||
                      !chatForm.message.trim()
                    ) {
                      alert(
                        "Vui lòng điền đầy đủ Họ tên, Số điện thoại và Câu hỏi!",
                      );
                      return;
                    }
                    setChatSubmitted(true);
                  }}
                  className="space-y-3.5 text-xs sm:text-[13px]"
                >
                  <p className="text-gray-700 font-medium">
                    Anh chị vui lòng điền thông tin để chúng tôi liên hệ ngay!
                  </p>

                  {/* Họ và tên */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Họ và tên<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={chatForm.name}
                      onChange={(e) =>
                        setChatForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Ví dụ: Nguyễn Văn A"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-colors"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Số điện thoại
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="tel"
                      value={chatForm.phone}
                      onChange={(e) =>
                        setChatForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Ví dụ: 0901234567"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-colors"
                    />
                  </div>

                  {/* Địa chỉ email */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Địa chỉ email
                    </label>
                    <input
                      type="email"
                      value={chatForm.email}
                      onChange={(e) =>
                        setChatForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="email@example.com (không bắt buộc)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-colors"
                    />
                  </div>

                  {/* Câu hỏi của bạn */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Câu hỏi của bạn
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={chatForm.message}
                      onChange={(e) =>
                        setChatForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Bạn cần tư vấn mẫu hoa nào, thời gian giao hàng..."
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 text-xs sm:text-sm focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-colors resize-none"
                    />
                  </div>

                  {/* Nút gửi: Bắt đầu hội thoại */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-[#86efac] hover:bg-[#22c55e] text-green-900 hover:text-white font-bold rounded-lg transition-all duration-200 cursor-pointer shadow-md active:scale-98 text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-1.5"
                  >
                    <span>Bắt đầu hội thoại</span>
                  </button>
                </form>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">
                    Gửi yêu cầu thành công!
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed px-2">
                    Cảm ơn{" "}
                    <span className="font-semibold text-gray-900">
                      {chatForm.name}
                    </span>
                    ! Đội ngũ CSKH Hoa Yêu Thương sẽ liên hệ số{" "}
                    <span className="font-semibold text-gray-900">
                      {chatForm.phone}
                    </span>{" "}
                    trong ít phút.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setChatForm({
                        name: "",
                        phone: "",
                        email: "",
                        message: "",
                      });
                      setChatSubmitted(false);
                      setChatOpen(false);
                    }}
                    className="mt-3 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Gửi câu hỏi khác
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
