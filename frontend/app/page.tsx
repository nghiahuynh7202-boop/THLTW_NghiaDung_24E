"use client";

import React, { useState } from "react";
import Link from "next/link";
import Banner from "../components/Banner";
import ProductCard, { ProductItem } from "../components/ProductCard";
import { ChevronRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Danh sách sản phẩm mẫu theo chính xác ảnh chụp
  const defaultProducts: ProductItem[] = [
    {
      id: 1,
      name: "Thương",
      slug: "thuong",
      price: 350000,
      image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&auto=format&fit=crop&q=80",
      isNew: true,
      isFreeShip: false,
    },
    {
      id: 2,
      name: "Victo rose",
      slug: "victo-rose",
      price: 300000,
      image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=500&auto=format&fit=crop&q=80",
      isNew: false,
      isFreeShip: false,
    },
    {
      id: 3,
      name: "My sun",
      slug: "my-sun",
      price: 150000,
      image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&auto=format&fit=crop&q=80",
      isNew: false,
      isFreeShip: false,
    },
    {
      id: 4,
      name: "Yêu",
      slug: "yeu",
      price: 350000,
      image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=500&auto=format&fit=crop&q=80",
      isNew: false,
      isFreeShip: false,
    },
    {
      id: 5,
      name: "Mini flower vase 06",
      slug: "mini-flower-vase-06",
      price: 350000,
      image: "https://images.unsplash.com/photo-1533616688419-b7a585564566?w=500&auto=format&fit=crop&q=80",
      isNew: true,
      isFreeShip: false,
    },
    {
      id: 6,
      name: "Ngọt",
      slug: "ngot",
      price: 350000,
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&auto=format&fit=crop&q=80",
      isNew: true,
      isFreeShip: false,
    },
    {
      id: 7,
      name: "An nhiên 2",
      slug: "an-nhien-2",
      price: 650000,
      image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=500&auto=format&fit=crop&q=80",
      isNew: true,
      isFreeShip: true,
    },
    {
      id: 8,
      name: "Xinh",
      slug: "xinh",
      price: 300000,
      image: "https://images.unsplash.com/photo-1589244159943-460088ed5c92?w=500&auto=format&fit=crop&q=80",
      isNew: true,
      isFreeShip: false,
    },
    {
      id: 9,
      name: "Pastel love",
      slug: "pastel-love",
      price: 400000,
      image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80",
      isNew: false,
      isFreeShip: true,
    },
    {
      id: 10,
      name: "Thơ",
      slug: "tho",
      price: 350000,
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80",
      isNew: true,
      isFreeShip: false,
    },
  ];

  const [products] = useState<ProductItem[]>(defaultProducts);

  const handleAddToCart = (product: ProductItem) => {
    setToastMessage(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="bg-white min-h-screen py-4 sm:py-6 font-sans">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* 1. KHỐI BANNER "ĐỒNG HÀNH CÙNG NÔNG DÂN" & "TƯ VẤN CHỌN HOA TƯƠI" */}
        <Banner />

        {/* 2. TIÊU ĐỀ BỘ SƯU TẬP THEO MẪU */}
        <div className="mb-3 pt-2">
          <h2 className="text-[#9e1c24] text-base sm:text-lg font-bold uppercase tracking-wide">
            MẪU HOA MỚI NĂM 2026
          </h2>
        </div>

        {/* 3. KHỐI SẢN PHẨM KHUNG XANH DƯƠNG NHẠT (ĐÚNG THEO MẪU ẢNH) */}
        <div className="bg-[#eaf4fc] p-3 sm:p-5 rounded-sm border border-[#d2e7fa] shadow-xs">
          
          {/* LƯỚI 5 CỘT SẢN PHẨM */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            {products.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* NÚT XEM THÊM SẢN PHẨM */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-medium rounded-xs border border-gray-300 shadow-xs hover:text-[#d32f2f] hover:border-[#d32f2f] transition-all group"
            >
              <span>Xem thêm hơn 714 sản phẩm</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-gray-400 group-hover:text-[#d32f2f]" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
