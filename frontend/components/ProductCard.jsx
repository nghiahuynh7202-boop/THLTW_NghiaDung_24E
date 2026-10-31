"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";

const resolveImgUrl = (rawImg) => {
  const raw = rawImg ? String(rawImg).trim() : "";
  if (!raw) return "/images/hoa.jpg";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:") || raw.startsWith("/images/")) {
    return raw;
  }
  const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
  const cleanPath = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `http://${hostname}:8000/storage/${cleanPath}`;
};

export default function ProductCard({ product, onAddToCart }) {
  const [imgSrc, setImgSrc] = useState(() => resolveImgUrl(product?.image));

  useEffect(() => {
    setImgSrc(resolveImgUrl(product?.image));
  }, [product?.image]);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const productUrl = `/products/${product.slug || product.id}`;

  // Chuẩn hóa giá: hỗ trợ cả raw API (price, sale_price) và formatted (price, originalPrice)
  const rawPrice = Number(product?.price || 0);
  const rawSalePrice =
    product?.sale_price !== null && product?.sale_price !== undefined && product?.sale_price !== ""
      ? Number(product.sale_price)
      : null;

  let currentPrice = rawPrice;
  let originalPrice = null;

  if (product?.originalPrice && Number(product.originalPrice) > rawPrice) {
    // Trường hợp đã qua format: price là giá sau giảm, originalPrice là giá gốc
    currentPrice = rawPrice;
    originalPrice = Number(product.originalPrice);
  } else if (rawSalePrice !== null && rawSalePrice > 0 && rawSalePrice < rawPrice) {
    // Trường hợp raw từ API: price là giá gốc, sale_price là giá khuyến mãi
    currentPrice = rawSalePrice;
    originalPrice = rawPrice;
  }

  const hasSale = originalPrice !== null && originalPrice > currentPrice;
  const discountPercent = hasSale
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative border border-gray-100 hover:-translate-y-1 p-2.5 sm:p-3">
      {/* 1. KHU VỰC HÌNH ẢNH */}
      <div className="relative w-full aspect-[4/4.8] bg-white rounded-xl flex items-center justify-center overflow-hidden">
        {/* Badge Nổi bật nếu có */}
        {(product.is_featured === 1 || product.is_featured === true || product.is_featured === "1") && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            ⭐ Nổi bật
          </div>
        )}

        {/* Badge Giảm giá % nếu có */}
        {hasSale && discountPercent > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            -{discountPercent}%
          </div>
        )}

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
              if (onAddToCart) {
                onAddToCart({
                  ...product,
                  image: imgSrc || resolveImgUrl(product?.image),
                  price: currentPrice,
                  originalPrice: hasSale ? originalPrice : null,
                });
              }
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

        {/* Hàng giá: Giá cũ gạch ngang (nếu có sale) + Giá mới cam đỏ nổi bật */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          {hasSale && (
            <span className="text-[11px] sm:text-xs text-gray-400 line-through font-normal">
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className="text-xs sm:text-[15px] font-extrabold text-[#e50914] tracking-tight">
            {formatPrice(currentPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
