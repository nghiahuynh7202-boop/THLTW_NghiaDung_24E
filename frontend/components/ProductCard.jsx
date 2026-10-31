"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import API_CONFIG from "@/config/api";

export default function ProductCard({ product, onAddToCart }) {
  // Lấy đường dẫn ảnh
  const getImageUrl = (img) => {
    if (!img) return "/images/hoa.jpg";
    if (img.startsWith("http") || img.startsWith("blob:") || img.startsWith("/images/")) return img;
    const clean = img.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `${API_CONFIG.ROOT_URL}/storage/${clean}`;
  };

  const [imgSrc, setImgSrc] = useState(() => getImageUrl(product?.image));

  // Định dạng tiền Việt Nam
  const formatMoney = (val) => Number(val || 0).toLocaleString("vi-VN") + "đ";

  const productUrl = `/products/${product?.slug || product?.id}`;
  const price = Number(product?.price || 0);
  const salePrice = product?.sale_price ? Number(product.sale_price) : null;
  const isSale = salePrice && salePrice < price;

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative border border-gray-100 hover:-translate-y-1 p-2.5 sm:p-3">
      {/* 1. Hình ảnh sản phẩm */}
      <div className="relative w-full aspect-[4/4.8] bg-white rounded-xl flex items-center justify-center overflow-hidden">
        {/* Huy hiệu nổi bật */}
        {Number(product?.is_featured) === 1 && (
          <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            ⭐ Nổi bật
          </div>
        )}

        {/* Huy hiệu giảm giá */}
        {isSale && (
          <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            -{Math.round(((price - salePrice) / price) * 100)}%
          </div>
        )}

        {/* Link chi tiết */}
        <Link href={productUrl} className="w-full h-full flex items-center justify-center">
          <img
            src={imgSrc}
            alt={product?.name || "Hoa tươi"}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc("/images/hoa.jpg")}
          />
        </Link>

        {/* Nút thao tác nhanh khi hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#e91e63] text-white py-2 px-1 flex items-center justify-around z-20 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onAddToCart) onAddToCart({ ...product, image: imgSrc });
            }}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold hover:text-yellow-200 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 fill-white" />
            <span>Thêm giỏ</span>
          </button>
          <div className="w-[1px] h-3.5 bg-white/40" />
          <Link
            href={productUrl}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold hover:text-yellow-200"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </Link>
        </div>
      </div>

      {/* 2. Tên và giá hoa */}
      <div className="pt-3 pb-1 text-center bg-white">
        <Link
          href={productUrl}
          className="text-xs sm:text-[13px] font-semibold text-[#15803d] hover:text-[#166534] line-clamp-1 mb-1.5 block"
        >
          {product?.name}
        </Link>

        <div className="flex items-center justify-center gap-2">
          {isSale && (
            <span className="text-[11px] text-gray-400 line-through">
              {formatMoney(price)}
            </span>
          )}
          <span className="text-xs sm:text-[15px] font-extrabold text-[#e50914]">
            {formatMoney(isSale ? salePrice : price)}
          </span>
        </div>
      </div>
    </div>
  );
}
