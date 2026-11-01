"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye, Heart, Image as ImageIcon } from "lucide-react";

/**
 * COMPONENT: Thẻ Sản Phẩm (Product Card) Chuẩn Shop Hoa
 * - Thiết kế theo mẫu: Ảnh dáng đứng, Tên canh trái 2 dòng, Giá màu cam nâu, Nút giỏ hàng xanh rêu
 * - Code ngắn gọn, đơn giản, dễ hiểu cho sinh viên làm đồ án
 */
export default function ProductCard({ product, onAddToCart }) {
  const [hasImgError, setHasImgError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // 1. Chuẩn hóa đường dẫn ảnh từ backend Laravel
  const getImageUrl = (img) => {
    if (!img) return "/images/hoa.jpg";
    const str = String(img).trim();
    if (
      str.startsWith("http://") ||
      str.startsWith("https://") ||
      str.startsWith("/images/")
    ) {
      return str;
    }
    const clean = str.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://127.0.0.1:8000/storage/${clean}`;
  };

  // 2. Tính toán giá gốc và giá sau giảm (nếu có)
  const price = Number(product?.price || 0);
  const salePrice = product?.salePrice ?? product?.sale_price;
  const hasSale =
    salePrice && Number(salePrice) > 0 && Number(salePrice) < price;
  const finalPrice = hasSale ? Number(salePrice) : price;

  // 3. Đường dẫn chi tiết sản phẩm
  const productUrl = `/products/${product?.slug || product?.id}`;

  return (
    <div className="group bg-white rounded-xl border border-gray-200/90 hover:border-gray-300 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden w-full max-w-[260px] mx-auto">
      {/* 1. KHU VỰC ẢNH: Kích thước nhỏ lại 1 chút xíu vừa vặn */}
      <div className="relative aspect-[4/4.7] w-full overflow-hidden bg-gray-50 block">
        {/* Ảnh hoa tươi */}
        <Link href={productUrl} className="block w-full h-full">
          {!product?.image || hasImgError ? (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageIcon className="w-10 h-10" />
            </div>
          ) : (
            <img
              src={getImageUrl(product.image)}
              alt={product?.name || "Hoa tươi"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setHasImgError(true)}
            />
          )}
        </Link>

        {/* Huy hiệu giảm giá (%) & Nổi bật góc trái ảnh */}
        {hasSale ? (
          <div className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
            -{Math.round(((price - finalPrice) / price) * 100)}%
          </div>
        ) : Number(product?.is_featured) === 1 ? (
          <div className="absolute top-2.5 left-2.5 z-10 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            ⭐ Nổi bật
          </div>
        ) : null}

        {/* Nút Xem nhanh (Eye) và Yêu thích (Heart) góc phải ảnh */}
        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <Link
            href={productUrl}
            title="Xem chi tiết"
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-xs flex items-center justify-center transition-all hover:scale-110"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            type="button"
            title="Yêu thích"
            onClick={() => setIsLiked(!isLiked)}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? "fill-rose-500 text-rose-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. THÔNG TIN SẢN PHẨM: Tên, Giá và Nút thêm vào giỏ */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        {/* Tên sản phẩm canh trái, tối đa 2 dòng */}
        <h3 className="text-sm font-medium text-gray-800 hover:text-[#f68b1f] transition-colors line-clamp-2 leading-snug mb-3 text-left">
          <Link href={productUrl}>{product?.name}</Link>
        </h3>

        {/* Chân thẻ: Giá tiền màu cam bên trái + Nút giỏ hàng xanh rêu bên phải */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          {/* Cụm giá tiền */}
          <div className="flex flex-col text-left">
            {hasSale && (
              <span className="text-xs text-gray-400 line-through">
                {price.toLocaleString("vi-VN")}đ
              </span>
            )}
            <span className="text-base sm:text-lg font-bold text-[#e67e22]">
              {finalPrice.toLocaleString("vi-VN")}
              <span className="text-sm underline ml-0.5">đ</span>
            </span>
          </div>

          {/* Nút Thêm vào giỏ màu xanh rêu */}
          <button
            type="button"
            title="Thêm vào giỏ hàng"
            onClick={(e) => {
              e.preventDefault();
              if (onAddToCart) onAddToCart(product);
            }}
            className="w-9 h-9 rounded-lg bg-[#537c63] hover:bg-[#3f634e] text-white flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
