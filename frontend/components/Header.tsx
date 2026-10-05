"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  User,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useState("Ho Chi Minh city");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(0);

  const subServices = [
    { name: "Điện hoa", image: "/images/434428_dien-hoa.png", href: "/category/dien-hoa" },
    { name: "Hoa cắt cành", image: "/images/434427_hoa-cat-canh.png", href: "/category/hoa-cat-canh" },
    { name: "Cây xanh", image: "/images/434426_cay-xanh.png", href: "/category/cay-xanh" },
    { name: "Hoa sáp", image: "/images/434879_hoa-sap.png", href: "/category/hoa-sap" },
    { name: "Only Rose", image: "/images/434454_only-rose.png", href: "/category/only-rose" },
    { name: "Giỏ trái cây", image: "/images/434436_gio-trai-cay.jpg", href: "/category/gio-trai-cay" },
    { name: "Lan hồ điệp", image: "/images/434425_lan-ho-diep.png", href: "/category/lan-ho-diep" },
    { name: "Quà tặng khác", image: "/images/434421_qua-tang-khac.png", href: "/category/qua-tang-khac" },
  ];

  const navMenuItems = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "CHỦ ĐỀ", href: "/chu-de" },
    { label: "ĐỐI TƯỢNG", href: "/doi-tuong" },
    { label: "KIỂU DÁNG", href: "/kieu-dang" },
    { label: "HOA TƯƠI", href: "/hoa-tuoi" },
    { label: "MÀU SẮC", href: "/mau-sac" },
    { label: "BỘ SƯU TẬP", href: "/bo-suu-tap" },
    { label: "QUÀ TẶNG KÈM", href: "/qua-tang-kem" },
    { label: "HOA CƯỚI", href: "/hoa-cuoi" },
    { label: "Ý NGHĨA HOA", href: "/y-nghia-hoa" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs transition-all font-sans">
      {/* 1. TOP BAR MÀU CAM */}
      <div className="bg-[#f68b1f] text-white text-xs py-1 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Chọn địa điểm */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <span className="font-normal text-white/90 text-[11px]">Nơi giao hoa:</span>
            <div className="flex items-center font-bold text-xs hover:text-amber-100 transition-colors">
              <span>{location}</span>
              <ChevronDown className="w-3 h-3 ml-1 transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>

          {/* Ngôn ngữ & Chuyển đổi cờ */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="English"
              className="hover:opacity-80 transition-opacity flex items-center gap-1 text-[11px] font-medium"
            >
              <span>🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
            <span className="text-white/40">|</span>
            <button
              type="button"
              title="Tiếng Việt"
              className="hover:opacity-80 transition-opacity flex items-center gap-1 text-[11px] font-medium"
            >
              <span>🇻🇳</span>
              <span className="hidden sm:inline">VI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-BRANDS / SERVICES BAR */}
      <div className="hidden lg:block border-b border-gray-100 bg-[#fdfdfd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5">
          <div className="grid grid-cols-8 divide-x divide-gray-100 text-center text-xs">
            {subServices.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="px-2 py-1 flex flex-col items-center justify-center hover:bg-orange-50/40 transition-colors group"
              >
                <div className="h-7 flex items-center justify-center mb-0.5">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={90}
                    height={28}
                    className="max-h-6 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </div>
                <span className="text-[11px] text-[#9e1c24] font-semibold group-hover:text-[#f68b1f] transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN HEADER SECTION (LAYOUT CHUẨN PIXEL-PERFECT THEO ẢNH CHỤP) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* CỘT TRÁI: LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-gray-600 hover:text-[#f68b1f] hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center group">
              <Image
                src="/images/logo-hoa-yeu-thuong.png"
                alt="Hoa Yêu Thương - Flower Delivery Expert"
                width={250}
                height={55}
                className="h-10 sm:h-12 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* CỘT GIỮA: Ô TÌM KIẾM Ở TRÊN + HOTLINE & ZALO Ở DƯỚI */}
          <div className="hidden md:flex flex-col items-center flex-1 max-w-xl mx-auto space-y-1.5">
            {/* Hàng 1: Ô tìm kiếm + Nút Tìm kiếm */}
            <form
              onSubmit={handleSearch}
              className="w-full flex items-center border border-gray-300 rounded-xs overflow-hidden bg-white shadow-2xs focus-within:border-gray-400 transition-colors"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm"
                className="w-full px-3.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-normal px-4 py-1.5 border-l border-gray-300 transition-colors whitespace-nowrap"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Hàng 2: Hotline Miền Nam, Hotline Miền Bắc, Zalo Gửi Tin Nhắn */}
            <div className="w-full flex items-center justify-between text-xs pt-0.5 px-1">
              {/* Hotline Miền Nam */}
              <div className="text-center">
                <span className="block text-[10px] text-gray-600 font-normal">
                  HOTLINE MIỀN NAM
                </span>
                <a
                  href="tel:02873002010"
                  className="font-bold text-xs text-[#f68b1f] hover:underline"
                >
                  028 73002010
                </a>
              </div>

              {/* Hotline Miền Bắc */}
              <div className="text-center">
                <span className="block text-[10px] text-gray-600 font-normal">
                  HOTLINE MIỀN BẮC
                </span>
                <a
                  href="tel:02473002010"
                  className="font-bold text-xs text-[#f68b1f] hover:underline"
                >
                  024 73002010
                </a>
              </div>

              {/* Zalo Button */}
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-[#0068ff] bg-white text-[#0068ff] px-3 py-1 rounded-full text-xs font-semibold shadow-2xs hover:bg-blue-50/50 transition-all"
              >
                <div className="w-4 h-4 rounded-full bg-[#0068ff] text-white flex items-center justify-center text-[8px] font-bold">
                  zalo
                </div>
                <span>Gửi tin nhắn</span>
              </a>
            </div>
          </div>

          {/* CỘT PHẢI: GIỎ HÀNG & TÀI KHOẢN */}
          <div className="flex items-center gap-5 lg:gap-7 flex-shrink-0">
            {/* Giỏ hàng */}
            <Link
              href="/cart"
              className="flex flex-col items-center justify-center text-gray-800 hover:text-[#f68b1f] transition-colors group relative"
            >
              <div className="relative">
                <ShoppingBag className="w-7 h-7 stroke-[1.25] text-gray-800 group-hover:text-[#f68b1f] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#d32f2f] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-700 group-hover:text-[#f68b1f] font-normal mt-0.5">
                Giỏ hàng
              </span>
            </Link>

            {/* Tài khoản */}
            <Link
              href="/login"
              className="flex flex-col items-center justify-center text-gray-800 hover:text-[#f68b1f] transition-colors group"
            >
              <div className="w-7 h-7 rounded-full border border-gray-800 group-hover:border-[#f68b1f] flex items-center justify-center transition-colors">
                <User className="w-4 h-4 stroke-[1.5] text-gray-800 group-hover:text-[#f68b1f] transition-colors" />
              </div>
              <span className="text-[11px] text-gray-700 group-hover:text-[#f68b1f] font-normal mt-0.5">
                Tài khoản
              </span>
            </Link>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-xs overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm sản phẩm"
              className="w-full px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#f68b1f] text-white text-xs font-medium px-3.5 py-1.5"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* 4. MAIN NAVIGATION MENU */}
      <nav className="border-t border-b border-gray-200 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center justify-between text-xs font-bold text-gray-700">
            {navMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="py-2.5 px-2 hover:text-[#f68b1f] hover:bg-orange-50/50 transition-colors uppercase tracking-tight relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#f68b1f] group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </div>

          {/* Mobile Nav Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-gray-200 space-y-1 bg-white">
              {navMenuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-orange-50 hover:text-[#f68b1f] rounded-md transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
