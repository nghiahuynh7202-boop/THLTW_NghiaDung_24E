"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, User, ChevronDown, Menu, X, LogOut, LogIn, UserPlus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getPublicMenus } from "@/services/menuServices";

export default function Header() {
    const router = useRouter();
    const { totalCount } = useCart();
    const { user, logout } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);
    const [location] = useState("Ho Chi Minh city");
    const [searchQuery, setSearchQuery] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 30;
            setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const currentUser = isMounted ? user : null;
    const currentCartCount = isMounted ? totalCount : 0;
    const handleLogout = () => {
        logout();
        setAccountMenuOpen(false);
        alert("Đã đăng xuất thành công!");
        router.push("/login");
    };
    // Close account dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (accountMenuRef.current &&
                !accountMenuRef.current.contains(event.target)) {
                setAccountMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
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
    const DEFAULT_MENUS = [
        { label: "TRANG CHỦ", href: "/" },
        { label: "GIỚI THIỆU", href: "/pages/gioi-thieu" },
        { label: "SẢN PHẨM", href: "/products" },
        { label: "BÀI VIẾT", href: "/posts" },
        { label: "LIÊN HỆ", href: "/contact" },
    ];
    const [navMenuItems, setNavMenuItems] = useState(DEFAULT_MENUS);

    // Lấy dữ liệu menu trực tiếp từ Quản lý Menu (Database)
    useEffect(() => {
        getPublicMenus()
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const sorted = [...data].sort((a, b) => Number(a.order_num || 0) - Number(b.order_num || 0));
                    setNavMenuItems(
                        sorted.map((item) => ({
                            label: (item.name || "").toUpperCase(),
                            href: item.link || "/",
                        }))
                    );
                }
            })
            .catch((err) => {
                console.error("Lỗi lấy danh sách menu:", err);
            });
    }, []);
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };
    return (
      <header className="w-full bg-white font-sans">
        {/* 1. TOP BAR MÀU CAM (Cuộn tự nhiên theo trang) */}
        <div className="bg-[#f68b1f] text-white text-xs px-4 sm:px-8 py-1">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Chọn địa điểm */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="font-normal text-white/90 text-[11px]">Nơi giao hoa:</span>
              <div className="flex items-center font-bold text-xs hover:text-amber-100 transition-colors">
                <span>{location}</span>
                <ChevronDown className="w-3 h-3 ml-1 transition-transform group-hover:translate-y-0.5"/>
              </div>
            </div>

            {/* Ngôn ngữ & Chuyển đổi cờ */}
            <div className="flex items-center gap-3">
              <button type="button" title="English" className="hover:opacity-80 transition-opacity flex items-center gap-1 text-[11px] font-medium">
                <span>🇬🇧</span>
                <span className="hidden sm:inline">EN</span>
              </button>
              <span className="text-white/40">|</span>
              <button type="button" title="Tiếng Việt" className="hover:opacity-80 transition-opacity flex items-center gap-1 text-[11px] font-medium">
                <span>🇻🇳</span>
                <span className="hidden sm:inline">VI</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. SUB-BRANDS / SERVICES BAR (Cuộn tự nhiên theo trang) */}
        <div className="hidden lg:block bg-[#fdfdfd] border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5">
            <div className="grid grid-cols-8 divide-x divide-gray-100 text-center text-xs">
              {subServices.map((item, idx) => (
                <Link key={idx} href={item.href} className="px-2 py-1 flex flex-col items-center justify-center hover:bg-orange-50/40 transition-colors group">
                  <div className="h-7 flex items-center justify-center mb-0.5">
                    <Image src={item.image} alt={item.name} width={90} height={28} className="max-h-6 w-auto object-contain transition-transform group-hover:scale-105"/>
                  </div>
                  <span className="text-[11px] text-[#9e1c24] font-semibold group-hover:text-[#f68b1f] transition-colors">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* KHUNG CỐ ĐỊNH (STICKY HEADER): MAIN HEADER + THANH MENU CHÍNH */}
        <div className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 ${isScrolled ? "shadow-md" : ""}`}>
          {/* 3. MAIN HEADER SECTION */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 sm:py-2.5">
            <div className="flex items-center justify-between gap-4 lg:gap-8">
              
              {/* CỘT TRÁI: LOGO */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {/* Mobile menu toggle */}
                <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1.5 text-gray-600 hover:text-[#f68b1f] hover:bg-gray-100 rounded-md transition-colors" aria-label="Toggle Menu">
                  {mobileMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
                </button>

                <Link href="/" className="flex items-center group">
                  <Image src="/images/logo-hoa-yeu-thuong.png" alt="Hoa Yêu Thương - Flower Delivery Expert" width={250} height={55} className="h-10 sm:h-12 w-auto object-contain" priority/>
                </Link>
              </div>

              {/* CỘT GIỮA: Ô TÌM KIẾM Ở TRÊN + HOTLINE & ZALO Ở DƯỚI */}
              <div className="hidden md:flex flex-col items-center flex-1 max-w-xl mx-auto space-y-1">
                {/* Hàng 1: Ô tìm kiếm + Nút Tìm kiếm */}
                <form onSubmit={handleSearch} className="w-full flex items-center border border-gray-300 rounded-xs overflow-hidden bg-white shadow-2xs focus-within:border-gray-400 transition-colors">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm sản phẩm" className="w-full px-3.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"/>
                  <button type="submit" className="bg-white hover:bg-gray-50 text-gray-700 text-xs font-normal px-4 py-1.5 border-l border-gray-300 transition-colors whitespace-nowrap">
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
                    <a href="tel:02873002010" className="font-bold text-xs text-[#f68b1f] hover:underline">
                      028 73002010
                    </a>
                  </div>

                  {/* Hotline Miền Bắc */}
                  <div className="text-center">
                    <span className="block text-[10px] text-gray-600 font-normal">
                      HOTLINE MIỀN BẮC
                    </span>
                    <a href="tel:02473002010" className="font-bold text-xs text-[#f68b1f] hover:underline">
                      024 73002010
                    </a>
                  </div>

                  {/* Zalo Button */}
                  <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-[#0068ff] bg-white text-[#0068ff] px-3 py-1 rounded-full text-xs font-semibold shadow-2xs hover:bg-blue-50/50 transition-all">
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
                <Link href="/cart" className="flex flex-col items-center justify-center text-gray-800 hover:text-[#f68b1f] transition-colors group relative">
                  <div className="relative">
                    <ShoppingBag className="w-7 h-7 stroke-[1.25] text-gray-800 group-hover:text-[#f68b1f] transition-colors"/>
                    {currentCartCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-[#d32f2f] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {currentCartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-700 group-hover:text-[#f68b1f] font-normal mt-0.5">
                    Giỏ hàng
                  </span>
                </Link>

                {/* Tài khoản */}
                <div className="relative" ref={accountMenuRef}>
                  {currentUser ? (
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-white hover:from-orange-100 hover:to-orange-50 border border-orange-200/90 hover:border-[#f68b1f] shadow-2xs hover:shadow-xs transition-all duration-200 group cursor-pointer focus:outline-none"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f68b1f] to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs ring-2 ring-white">
                        {currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] text-gray-400 font-medium leading-none">Xin chào</span>
                        <span className="text-xs text-gray-800 group-hover:text-[#f68b1f] font-bold leading-tight max-w-[85px] truncate">
                          {currentUser.name.split(" ").slice(-1)[0] || "Tài khoản"}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#f68b1f] transition-transform duration-200 ${
                          accountMenuOpen ? "rotate-180 text-[#f68b1f]" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-orange-50/70 border border-transparent hover:border-orange-200 text-gray-700 hover:text-[#f68b1f] transition-all duration-200 group cursor-pointer focus:outline-none"
                    >
                      <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center text-gray-600 group-hover:text-[#f68b1f] transition-colors">
                        <User className="w-4 h-4 stroke-[1.5]"/>
                      </div>
                      <span className="text-xs font-semibold">Tài khoản</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#f68b1f] transition-transform duration-200 ${
                          accountMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs overflow-hidden">
                      {currentUser ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50/70 to-amber-50/40 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f68b1f] to-amber-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs ring-2 ring-white flex-shrink-0">
                              {currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-900 truncate text-xs">{currentUser.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold bg-orange-100 text-[#f68b1f] rounded-full">
                                {currentUser.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                              </span>
                            </div>
                          </div>

                          <div className="p-1.5 space-y-0.5">
                            <Link href="/profile" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#f68b1f] rounded-xl transition-colors font-medium">
                              <User className="w-4 h-4 text-gray-500"/>
                              <span>Thông tin cá nhân</span>
                            </Link>

                            {currentUser.role === "admin" && (
                              <Link href="/admin/products" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#f68b1f] rounded-xl transition-colors font-medium">
                                <span className="w-4 h-4 flex items-center justify-center text-xs">⚙️</span>
                                <span>Trang quản trị Admin</span>
                              </Link>
                            )}

                            <div className="pt-1 border-t border-gray-100 mt-1">
                              <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left font-medium cursor-pointer">
                                <LogOut className="w-4 h-4"/>
                                <span>Đăng xuất</span>
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100 bg-orange-50/40">
                            <p className="font-bold text-gray-800 text-xs">Chào mừng bạn</p>
                            <p className="text-[10px] text-gray-500">Đăng nhập để nhận ưu đãi</p>
                          </div>

                          <div className="p-2 space-y-1.5">
                            <Link href="/login" onClick={() => setAccountMenuOpen(false)} className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-white bg-[#f68b1f] hover:bg-[#e67300] rounded-xl transition-colors shadow-2xs">
                              <LogIn className="w-3.5 h-3.5"/>
                              <span>Đăng nhập</span>
                            </Link>

                            <Link href="/register" onClick={() => setAccountMenuOpen(false)} className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
                              <UserPlus className="w-3.5 h-3.5"/>
                              <span>Đăng ký tài khoản</span>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Mobile Search Input */}
            <div className="mt-2.5 md:hidden">
              <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-xs overflow-hidden">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm sản phẩm" className="w-full px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"/>
                <button type="submit" className="bg-[#f68b1f] text-white text-xs font-medium px-3.5 py-1.5">
                  Tìm
                </button>
              </form>
            </div>
          </div>

          {/* 4. MAIN NAVIGATION MENU */}
          <nav className="border-t border-b border-gray-200 bg-[#fafafa]">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center justify-center gap-10 sm:gap-14 text-xs font-bold text-gray-700">
                {navMenuItems.map((item, index) => (
                  <Link key={index} href={item.href} className="py-2.5 px-2 hover:text-[#f68b1f] hover:bg-orange-50/50 transition-colors uppercase tracking-tight relative group">
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#f68b1f] group-hover:w-full transition-all duration-200"/>
                  </Link>
                ))}
              </div>

              {/* Mobile Nav Drawer */}
              {mobileMenuOpen && (
                <div className="lg:hidden py-3 border-t border-gray-200 space-y-2 bg-white">
                  {/* Mobile Auth Status */}
                  <div className="p-3 bg-gray-50 rounded-lg mx-2 mb-2">
                    {currentUser ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f68b1f] to-amber-500 text-white ring-2 ring-white shadow-xs flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="flex-1 truncate">
                            <p className="font-bold text-gray-800 text-xs truncate">{currentUser.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                          </div>
                        </div>
                        <div className="pt-1 border-t border-gray-200 space-y-1">
                          <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block w-full py-1.5 px-3 text-center text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:text-[#f68b1f]">
                            Thông tin cá nhân
                          </Link>
                          <button type="button" onClick={handleLogout} className="w-full py-1.5 px-3 text-center text-xs font-medium text-red-600 bg-white border border-red-200 rounded">
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-xs font-semibold text-white bg-[#f68b1f] rounded-lg">
                          Đăng nhập
                        </Link>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">
                          Đăng ký
                        </Link>
                      </div>
                    )}
                  </div>

                  {navMenuItems.map((item, index) => (
                    <Link key={index} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-orange-50 hover:text-[#f68b1f] rounded-md transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>);
}
