"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";

export default function ProductCard({ product, onAddToCart }) {
  const [imgSrc, setImgSrc] = useState(() => {
    const raw = product?.image ? String(product.image).trim() : "";
    if (!raw) return "/images/hoa.jpg";
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:")) {
      return raw;
    }
    if (raw.startsWith("/images/")) {
      return raw;
    }
    const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
    const cleanPath = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://${hostname}:8000/storage/${cleanPath}`;
  });

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative border border-gray-100 hover:-translate-y-1 p-2.5 sm:p-3">
      {/* 1. KHU VỰC HÌNH ẢNH */}
      <div className="relative w-full aspect-[4/4.8] bg-white rounded-xl flex items-center justify-center overflow-hidden">
        {/* Link & Ảnh sản phẩm */}
        <Link
          href={productUrl}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={imgSrc}
            alt={product.name || "Hoa tươi"}
            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300 ease-out"
            loading="lazy"
            onError={() => {
              // Nếu ảnh bị lỗi hoặc không tìm thấy trên server, tự động dùng ảnh dự phòng
              setImgSrc("/images/hoa.jpg");
            }}
          />
        </Link>

        {/* THANH HỒNG HOVER "THÊM GIỎ | XEM CHI TIẾT" TRƯỢT LÊN KHI RÊ CHUỘT */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#e91e63] text-white py-2 px-1 flex items-center justify-around z-20 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md rounded-b-xl">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onAddToCart) onAddToCart(product);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold hover:text-yellow-200 transition-colors cursor-pointer py-0.5"
            title="Thêm vào giỏ"
          >
            <ShoppingCart className="w-3.5 h-3.5 fill-white" />
            <span>Thêm giỏ</span>
          </button>

          <div className="w-[1px] h-3.5 bg-white/40 mx-0.5 shrink-0" />

          <Link
            href={productUrl}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold hover:text-yellow-200 transition-colors py-0.5"
            title="Xem chi tiết"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </Link>
        </div>
      </div>

      {/* 2. KHU VỰC THÔNG TIN */}
      <div className="pt-3 pb-1 text-center bg-white flex flex-col items-center justify-center">
        {/* Tên sản phẩm */}
        <Link
          href={productUrl}
          title={product.name}
          className="text-xs sm:text-[13px] font-semibold text-[#15803d] hover:text-[#166534] transition-colors line-clamp-1 mb-1.5 capitalize block w-full tracking-tight"
        >
          {product.name}
        </Link>

        {/* Hàng giá: Giá cũ gạch ngang (nếu có) + Giá mới cam đỏ nổi bật */}
        <div className="flex items-baseline justify-center gap-2 flex-wrap">
          {product.originalPrice && product.originalPrice > product.price ? (
            <span className="text-[11px] sm:text-xs text-gray-400 line-through font-normal">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
          <span className="text-xs sm:text-[15px] font-bold text-[#ff3d00] tracking-tight">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
