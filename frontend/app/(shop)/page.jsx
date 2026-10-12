"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Banner from "@/components/Banner";
import CategorySlider from "@/components/CategorySlider";
import ProductCard from "@/components/ProductCard";
import { CheckCircle2, Flame, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [toastMessage, setToastMessage] = useState(null);

  // Ref và điều khiển cuộn 1 hàng Flash Sale
  const flashSaleRef = useRef(null);

  const scrollFlashSale = (direction) => {
    if (flashSaleRef.current) {
      const scrollAmount = 300;
      flashSaleRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Countdown timer cho Flash Sale (Khung 1 lửa)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 45, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // State lưu tab đang active cho từng khung
  const [activeTag1, setActiveTag1] = useState("all");
  const [activeTag2, setActiveTag2] = useState("all");
  const [activeTag3, setActiveTag3] = useState("all");
  const [activeTag4, setActiveTag4] = useState("all");

  // Xử lý thêm vào giỏ hàng & lưu localStorage + hiện Toast
  const handleAddToCart = (product) => {
    try {
      const savedCart = localStorage.getItem("cart");
      let cart = savedCart ? JSON.parse(savedCart) : [];
      if (!Array.isArray(cart)) cart = [];

      const existingIndex = cart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        cart[existingIndex].qty = (cart[existingIndex].qty || 1) + 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: 1,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }

    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /* =========================================================================
     DỮ LIỆU KHUNG 1: FLASH SALE GIÁ SỐC (CÓ KHUNG LỬA RỰC RỠ)
  ========================================================================= */
  const section1Tags = [
    { id: "all", label: "Tất cả" },
    { id: "bo-hoa", label: "Bó hoa tươi" },
    { id: "hop-hoa", label: "Hộp hoa tươi" },
    { id: "lang-hoa", label: "Lẵng hoa tươi" },
    { id: "hot-deal", label: "Hot Deal -30%" },
  ];

  const section1Products = [
    {
      id: 1,
      name: "Thương",
      slug: "thuong",
      price: 350000,
      originalPrice: 450000,
      image: "/images/hoa.jpg",
    },
    {
      id: 2,
      name: "Victo rose",
      slug: "victo-rose",
      price: 300000,
      originalPrice: 380000,
      image: "/images/hoa.jpg",
    },
    {
      id: 3,
      name: "My sun",
      slug: "my-sun",
      price: 150000,
      originalPrice: 220000,
      image: "/images/hoa.jpg",
    },
    {
      id: 4,
      name: "Yêu",
      slug: "yeu",
      price: 350000,
      originalPrice: 420000,
      image: "/images/hoa.jpg",
    },
    {
      id: 5,
      name: "Mini flower vase 06",
      slug: "mini-flower-vase-06",
      price: 350000,
      originalPrice: 400000,
      image: "/images/hoa.jpg",
    },
    {
      id: 6,
      name: "Ngọt",
      slug: "ngot",
      price: 350000,
      originalPrice: 420000,
      image: "/images/hoa.jpg",
    },
    {
      id: 7,
      name: "An nhiên 2",
      slug: "an-nhien-2",
      price: 650000,
      originalPrice: 790000,
      image: "/images/hoa.jpg",
    },
    {
      id: 8,
      name: "Xinh",
      slug: "xinh",
      price: 300000,
      originalPrice: 380000,
      image: "/images/hoa.jpg",
    },
    {
      id: 9,
      name: "Pastel love",
      slug: "pastel-love",
      price: 400000,
      originalPrice: 490000,
      image: "/images/hoa.jpg",
    },
    {
      id: 10,
      name: "Thơ",
      slug: "tho",
      price: 350000,
      originalPrice: 420000,
      image: "/images/hoa.jpg",
    },
  ];

  /* =========================================================================
     DỮ LIỆU KHUNG 2: HOA SINH NHẬT BÁN CHẠY (KHÔNG KHUNG NỀN)
  ========================================================================= */
  const section2Tags = [
    { id: "all", label: "Tất cả" },
    { id: "ban-gai", label: "Tặng bạn gái" },
    { id: "tang-me", label: "Tặng mẹ" },
    { id: "huong-duong", label: "Hoa hướng dương" },
    { id: "hoa-baby", label: "Hoa baby" },
  ];

  const section2Products = [
    {
      id: 11,
      name: "Nắng Ban Mai",
      slug: "nang-ban-mai",
      price: 390000,
      originalPrice: 450000,
      image: "/images/hoa.jpg",
    },
    {
      id: 12,
      name: "Hạnh Phúc Giản Đơn",
      slug: "hanh-phuc-gian-don",
      price: 450000,
      originalPrice: 520000,
      image: "/images/hoa.jpg",
    },
    {
      id: 13,
      name: "Nụ Cười Tuổi Mới",
      slug: "nu-cuoi-tuoi-moi",
      price: 320000,
      image: "/images/hoa.jpg",
    },
    {
      id: 14,
      name: "Mộng Mơ",
      slug: "mong-mo",
      price: 420000,
      originalPrice: 480000,
      image: "/images/hoa.jpg",
    },
    {
      id: 15,
      name: "Ánh Dương Rạng Rỡ",
      slug: "anh-duong-rang-ro",
      price: 350000,
      image: "/images/hoa.jpg",
    },
    {
      id: 16,
      name: "Giai Điệu Ngọt Ngào",
      slug: "giai-dieu-ngot-ngao",
      price: 480000,
      originalPrice: 550000,
      image: "/images/hoa.jpg",
    },
    {
      id: 17,
      name: "Giỏ Hoa Nắng Hồng",
      slug: "gio-hoa-nang-hong",
      price: 550000,
      originalPrice: 650000,
      image: "/images/hoa.jpg",
    },
    {
      id: 18,
      name: "Vườn Yêu Thương",
      slug: "vuon-yeu-thuong",
      price: 390000,
      image: "/images/hoa.jpg",
    },
    {
      id: 19,
      name: "Khu Vườn Cổ Tích",
      slug: "khu-vuon-co-tich",
      price: 620000,
      originalPrice: 720000,
      image: "/images/hoa.jpg",
    },
    {
      id: 20,
      name: "Bình Minh Tươi Sáng",
      slug: "binh-minh-tuoi-sang",
      price: 370000,
      image: "/images/hoa.jpg",
    },
  ];

  /* =========================================================================
     DỮ LIỆU KHUNG 3: HOA KHAI TRƯƠNG - HỒNG PHÁT TÀI LỘC (KHÔNG KHUNG NỀN)
  ========================================================================= */
  const section3Tags = [
    { id: "all", label: "Tất cả" },
    { id: "ke-hoa-2-tang", label: "Kệ hoa 2 tầng" },
    { id: "gio-hoa-de-ban", label: "Giỏ hoa để bàn" },
    { id: "hien-dai", label: "Kệ hoa hiện đại" },
    { id: "lan-ho-diep", label: "Lan hồ điệp" },
  ];

  const section3Products = [
    {
      id: 21,
      name: "Phát triển bền vững 01",
      slug: "phat-trien-ben-vung-01",
      price: 1770000,
      originalPrice: 1900000,
      image: "/images/hoa.jpg",
    },
    {
      id: 22,
      name: "Tài Lộc Vượng Tiến",
      slug: "tai-loc-vuong-tien",
      price: 950000,
      originalPrice: 1100000,
      image: "/images/hoa.jpg",
    },
    {
      id: 23,
      name: "Khởi Sắc Vươn Cao",
      slug: "khoi-sac-vuon-cao",
      price: 1250000,
      originalPrice: 1450000,
      image: "/images/hoa.jpg",
    },
    {
      id: 24,
      name: "Phát Tài Phát Lộc",
      slug: "phat-tai-phat-loc",
      price: 780000,
      image: "/images/hoa.jpg",
    },
    {
      id: 25,
      name: "Đại Thắng 2 Tầng",
      slug: "dai-thang-2-tang",
      price: 1450000,
      originalPrice: 1650000,
      image: "/images/hoa.jpg",
    },
    {
      id: 26,
      name: "Kinh Doanh Hưng Thịnh",
      slug: "kinh-doanh-hung-thinh",
      price: 890000,
      image: "/images/hoa.jpg",
    },
    {
      id: 27,
      name: "Vạn Sự Như Ý",
      slug: "van-su-nhu-y",
      price: 990000,
      originalPrice: 1150000,
      image: "/images/hoa.jpg",
    },
    {
      id: 28,
      name: "Tương Lai Rực Rỡ",
      slug: "tuong-lai-ruc-ro",
      price: 1150000,
      originalPrice: 1300000,
      image: "/images/hoa.jpg",
    },
    {
      id: 29,
      name: "Thuận Buồm Xuôi Gió",
      slug: "thuan-buom-xuoi-gio",
      price: 1350000,
      originalPrice: 1550000,
      image: "/images/hoa.jpg",
    },
    {
      id: 30,
      name: "Hợp Tác Bền Lâu",
      slug: "hop-tac-ben-lau",
      price: 920000,
      image: "/images/hoa.jpg",
    },
  ];

  /* =========================================================================
     DỮ LIỆU KHUNG 4: HOA TÌNH YÊU & ONLY ROSE (KHÔNG KHUNG NỀN)
  ========================================================================= */
  const section4Tags = [
    { id: "all", label: "Tất cả" },
    { id: "hong-do-99", label: "Hồng đỏ 99 bông" },
    { id: "hong-kem", label: "Hồng kem pastel" },
    { id: "hop-trai-tim", label: "Hộp trái tim" },
    { id: "ecuador", label: "Hồng Ecuador" },
  ];

  const section4Products = [
    {
      id: 31,
      name: "Say Đắm Nồng Nàn",
      slug: "say-dam-nong-nan",
      price: 490000,
      originalPrice: 560000,
      image: "/images/hoa.jpg",
    },
    {
      id: 32,
      name: "Chỉ Riêng Mình Em",
      slug: "chi-rieng-minh-em",
      price: 550000,
      originalPrice: 620000,
      image: "/images/hoa.jpg",
    },
    {
      id: 33,
      name: "Bản Tình Ca Mùa Hạ",
      slug: "ban-tinh-ca-mua-ha",
      price: 420000,
      image: "/images/hoa.jpg",
    },
    {
      id: 34,
      name: "Trái Tim Thổn Thức",
      slug: "trai-tim-thon-thuc",
      price: 680000,
      originalPrice: 780000,
      image: "/images/hoa.jpg",
    },
    {
      id: 35,
      name: "Hẹn Hò Dưới Mưa",
      slug: "hen-ho-duoi-mua",
      price: 450000,
      image: "/images/hoa.jpg",
    },
    {
      id: 36,
      name: "Lời Tỏ Tình Ngọt Ngào",
      slug: "loi-to-tinh-ngot-ngao",
      price: 590000,
      originalPrice: 680000,
      image: "/images/hoa.jpg",
    },
    {
      id: 37,
      name: "Hồng Nhung Quý Phái",
      slug: "hong-nhung-quy-phai",
      price: 750000,
      originalPrice: 850000,
      image: "/images/hoa.jpg",
    },
    {
      id: 38,
      name: "Nụ Hôn Đầu Tiên",
      slug: "nu-hon-dau-tien",
      price: 480000,
      image: "/images/hoa.jpg",
    },
    {
      id: 39,
      name: "Mãi Mãi Bên Nhau",
      slug: "mai-mai-ben-nhau",
      price: 1200000,
      originalPrice: 1400000,
      image: "/images/hoa.jpg",
    },
    {
      id: 40,
      name: "Ánh Mắt Người Thương",
      slug: "anh-mat-nguoi-thuong",
      price: 390000,
      image: "/images/hoa.jpg",
    },
  ];

  return (
    <div className="bg-white min-h-screen py-4 sm:py-6 font-sans">
      {/* TOAST THÔNG BÁO KHI BẤM THÊM GIỎ HÀNG */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-9 sm:space-y-12">
        {/* BANNER CHÍNH */}
        <Banner />

        {/* DANH MỤC TRƯỢT 1 HÀNG DƯỚI BANNER (HOVER HIỆN MŨI TÊN KÉO QUA) */}
        <CategorySlider />

        {/* =========================================================================
            KHUNG 1: FLASH SALE RỰC LỬA 🔥 (CHUẨN SALE ĐỎ CAM - 1 HÀNG TRƯỢT MŨI TÊN)
        ========================================================================= */}
        <div className="bg-[#fff8f5] p-4 sm:p-6 rounded-3xl border-2 border-[#ff3b30] shadow-lg shadow-red-500/10 relative overflow-hidden group/flash">
          {/* Header Flash Sale */}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 pb-3 border-b border-red-200/80">
            {/* Tiêu đề Flash Sale & Đếm ngược */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Badge Lửa cháy động siêu đẹp chuẩn theo Ảnh 2 */}
              <div className="relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-[#e50914] via-[#f84300] to-[#ff6600] text-white px-4 py-1.5 rounded-full text-xs font-black shadow-md shadow-orange-500/30 uppercase tracking-wider">
                {/* Tia sáng quét lướt qua badge */}
                <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer pointer-events-none" />

                {/* Ngọn lửa bập bùng sống động */}
                <div className="relative z-10 flex items-center justify-center w-5 h-5 animate-flame">
                  <Flame className="w-5 h-5 text-amber-200 fill-[#ffcc00]" />
                  <Flame className="w-3.5 h-3.5 text-[#ff2200] fill-[#ff3b00] absolute -bottom-0.5" />
                </div>
                <span className="relative z-10 font-black text-sm tracking-wide">FLASH SALE</span>
              </div>

              {/* Tiêu đề chuẩn theo Ảnh 2: GIỜ (đỏ) - VÀNG GIÁ SỐC (cam) */}
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-1.5 drop-shadow-xs">
                <span className="text-[#e50914]">GIỜ</span>
                <span className="text-[#ff5a00]">VÀNG GIÁ SỐC</span>
              </h2>

              {/* Đồng hồ đếm ngược kết thúc */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 sm:ml-2 bg-white/95 px-3 py-1 rounded-full border border-red-300 shadow-xs">
                <span className="text-[11px] text-gray-500 font-medium">Kết thúc trong:</span>
                <span className="bg-gradient-to-b from-red-600 to-orange-600 text-white font-mono px-2 py-0.5 rounded-md font-black shadow-xs">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-red-500 font-bold">:</span>
                <span className="bg-gradient-to-b from-red-600 to-orange-600 text-white font-mono px-2 py-0.5 rounded-md font-black shadow-xs">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-red-500 font-bold">:</span>
                <span className="bg-gradient-to-b from-red-600 to-orange-600 text-white font-mono px-2 py-0.5 rounded-md font-black shadow-xs">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Pill tags Flash Sale */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {section1Tags.map((tag) => {
                const isActive = activeTag1 === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setActiveTag1(tag.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-orange-500 text-white border-red-600 shadow-md shadow-red-500/30 font-bold"
                        : "bg-white text-gray-700 border-red-200 hover:border-red-500 hover:text-red-600"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1 HÀNG DUY NHẤT VỚI 2 MŨI TÊN KÉO QUA LẠI */}
          <div className="relative">
            {/* Nút mũi tên trái */}
            <button
              type="button"
              onClick={() => scrollFlashSale("left")}
              aria-label="Xem sản phẩm trước"
              className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-red-600 shadow-xl border border-red-200 hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-500 hover:text-white hover:border-transparent transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Dãy sản phẩm 1 hàng cuộn ngang */}
            <div
              ref={flashSaleRef}
              className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto scroll-smooth no-scrollbar py-2 px-1"
            >
              {section1Products.map((item) => (
                <div
                  key={item.id}
                  className="w-[195px] sm:w-[225px] lg:w-[235px] flex-shrink-0"
                >
                  <ProductCard
                    product={item}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>

            {/* Nút mũi tên phải */}
            <button
              type="button"
              onClick={() => scrollFlashSale("right")}
              aria-label="Xem sản phẩm tiếp theo"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-red-600 shadow-xl border border-red-200 hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-500 hover:text-white hover:border-transparent transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Nút Xem Thêm đỏ cam */}
          <div className="mt-5 mb-1 flex justify-center">
            <Link
              href="/category/flash-sale"
              className="inline-flex items-center justify-center px-8 py-2.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-700 hover:to-orange-600 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-md shadow-md shadow-red-500/25 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>XEM TẤT CẢ FLASH SALE</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            KHUNG 2: HOA SINH NHẬT BÁN CHẠY (HOÀN TOÀN XÓA BỎ KHUNG NỀN - NỀN TRẮNG TINH KHÔI)
        ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-2.5">
            <h2 className="text-[#222222] text-base sm:text-lg font-bold uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-4.5 bg-[#f68b1f] rounded-full inline-block" />
              HOA SINH NHẬT BÁN CHẠY
            </h2>

            <div className="flex items-center gap-1.5 flex-wrap">
              {section2Tags.map((tag) => {
                const isActive = activeTag2 === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setActiveTag2(tag.id)}
                    className={`px-3 py-1 text-xs font-normal rounded-full border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#333333] text-white border-[#333333]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#f68b1f] hover:text-[#f68b1f]"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lưới sản phẩm trực tiếp trên nền trắng */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {section2Products.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <div className="mt-6 mb-2 flex justify-center">
            <Link
              href="/category/hoa-sinh-nhat"
              className="inline-flex items-center justify-center px-8 py-2.5 bg-[#ff4081] hover:bg-[#e91e63] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>XEM THÊM</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            KHUNG 3: HOA KHAI TRƯƠNG - HỒNG PHÁT TÀI LỘC (HOÀN TOÀN XÓA BỎ KHUNG NỀN)
        ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-2.5">
            <h2 className="text-[#222222] text-base sm:text-lg font-bold uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-4.5 bg-[#b91c1c] rounded-full inline-block" />
              HOA KHAI TRƯƠNG - HỒNG PHÁT TÀI LỘC
            </h2>

            <div className="flex items-center gap-1.5 flex-wrap">
              {section3Tags.map((tag) => {
                const isActive = activeTag3 === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setActiveTag3(tag.id)}
                    className={`px-3 py-1 text-xs font-normal rounded-full border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#333333] text-white border-[#333333]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#f68b1f] hover:text-[#f68b1f]"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lưới sản phẩm trực tiếp trên nền trắng */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {section3Products.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <div className="mt-6 mb-2 flex justify-center">
            <Link
              href="/category/hoa-khai-truong"
              className="inline-flex items-center justify-center px-8 py-2.5 bg-[#ff4081] hover:bg-[#e91e63] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>XEM THÊM</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            KHUNG 4: HOA TÌNH YÊU & ONLY ROSE (HOÀN TOÀN XÓA BỎ KHUNG NỀN)
        ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 pb-2.5">
            <h2 className="text-[#222222] text-base sm:text-lg font-bold uppercase tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-4.5 bg-[#e91e63] rounded-full inline-block" />
              HOA TÌNH YÊU & ONLY ROSE
            </h2>

            <div className="flex items-center gap-1.5 flex-wrap">
              {section4Tags.map((tag) => {
                const isActive = activeTag4 === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setActiveTag4(tag.id)}
                    className={`px-3 py-1 text-xs font-normal rounded-full border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#333333] text-white border-[#333333]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#f68b1f] hover:text-[#f68b1f]"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lưới sản phẩm trực tiếp trên nền trắng */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {section4Products.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <div className="mt-6 mb-2 flex justify-center">
            <Link
              href="/category/hoa-tinh-yeu"
              className="inline-flex items-center justify-center px-8 py-2.5 bg-[#ff4081] hover:bg-[#e91e63] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xs shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>XEM THÊM</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
