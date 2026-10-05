"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// SVG Icons cho mạng xã hội và tiện ích để không bị phụ thuộc phiên bản thư viện
function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function HeartIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

export default function Footer() {
  const customerCareLinks = [
    { name: "Giới Thiệu", href: "/pages/gioi-thieu" },
    { name: "Liên Hệ", href: "/contact" },
    { name: "Chính Sách Vận Chuyển", href: "/pages/chinh-sach-van-chuyen" },
    { name: "Câu Hỏi Thường Gặp", href: "/pages/cau-hoi-thuong-gap" },
    { name: "Hình Thức Thanh Toán", href: "/pages/hinh-thuc-thanh-toan" },
    { name: "Bảo Mật Thông Tin", href: "/pages/bao-mat-thong-tin" },
    { name: "Chính Sách Hoàn Tiền", href: "/pages/chinh-sach-hoan-tien" },
    { name: "Xử Lý Khiếu Nại", href: "/pages/xu-ly-khieu-nai" },
    { name: "Tại Sao Nên Chọn FlowerCorner.vn", href: "/pages/tai-sao-chon-chung-toi" },
    { name: "Blog", href: "/blog" },
  ];

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com", icon: FacebookIcon, color: "hover:text-[#1877f2]" },
    { name: "Twitter", href: "https://twitter.com", icon: TwitterIcon, color: "hover:text-[#1da1f2]" },
    { name: "Instagram", href: "https://instagram.com", icon: InstagramIcon, color: "hover:text-[#e4405f]" },
    { name: "Linkedin", href: "https://linkedin.com", icon: LinkedinIcon, color: "hover:text-[#0a66c2]" },
    { name: "Youtube", href: "https://youtube.com", icon: YoutubeIcon, color: "hover:text-[#ff0000]" },
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
                <a href="tel:1900633045" className="hover:text-[#d81b60] font-medium">1900633045</a> -{" "}
                <a href="tel:0865160360" className="hover:text-[#d81b60] font-medium">0865160360</a>
              </p>
              <p>
                <span className="font-semibold text-gray-800">Email:</span>{" "}
                <a href="mailto:sales@flowercorner.vn" className="hover:text-[#d81b60] font-medium">
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
              <span className="font-bold text-gray-800 block">Cửa hàng chính:</span>
              <span>142 Nguyễn Văn Cừ, Phường Cầu Ông Lãnh, TP.HCM</span>
            </div>

            <div>
              <span className="font-bold text-gray-800 block">Cửa Hàng TP.HCM:</span>
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
    </footer>
  );
}
