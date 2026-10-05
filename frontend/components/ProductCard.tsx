"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export interface ProductItem {
  id: number | string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  isFreeShip?: boolean;
}

interface ProductCardProps {
  product: ProductItem;
  onAddToCart?: (product: ProductItem) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <div className="bg-white border border-gray-200/90 rounded-xs hover:border-[#f68b1f]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden relative">
      {/* 1. KHU VỰC HÌNH ẢNH */}
      <div className="relative w-full aspect-[4/4.8] bg-white p-2 flex items-center justify-center overflow-hidden">
        {/* Badge NEW! (Góc trên bên phải) */}
        {product.isNew !== false && (
          <div className="absolute top-2 right-0 z-10">
            <div className="bg-[#b71c1c] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 shadow-xs uppercase tracking-tight rounded-l-xs">
              NEW!
            </div>
          </div>
        )}

        {/* Link & Ảnh sản phẩm */}
        <Link href={productUrl} className="w-full h-full flex items-center justify-center">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={260}
              height={320}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
              <ShoppingBag className="w-12 h-12 stroke-[1]" />
            </div>
          )}
        </Link>

        {/* Badge FREESHIP (Góc dưới bên trái của ảnh) */}
        {product.isFreeShip && (
          <div className="absolute bottom-2 left-0 z-10">
            <div className="bg-[#f57c00] text-white text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 shadow-xs uppercase tracking-wider rounded-r-xs">
              FREESHIP
            </div>
          </div>
        )}
      </div>

      {/* 2. KHU VỰC THÔNG TIN (TÊN & GIÁ) */}
      <div className="border-t border-gray-100 p-2.5 sm:p-3 text-center bg-white flex flex-col items-center justify-center">
        <Link
          href={productUrl}
          title={product.name}
          className="text-xs sm:text-sm font-normal text-gray-800 hover:text-[#d32f2f] transition-colors line-clamp-1 mb-1 capitalize block w-full"
        >
          {product.name}
        </Link>

        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-[#d32f2f]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Nút thêm nhanh vào giỏ khi hover */}
        {onAddToCart && (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="mt-2 w-full py-1 text-[11px] font-semibold text-[#d32f2f] bg-rose-50 hover:bg-[#d32f2f] hover:text-white rounded-xs transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Thêm vào giỏ</span>
          </button>
        )}
      </div>
    </div>
  );
}
