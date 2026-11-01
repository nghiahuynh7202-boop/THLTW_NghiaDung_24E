"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/home/Toast";
import { useToast } from "@/hooks/useToast";
import RelatedProducts from "./RelatedProducts";

/**
 * GIAO DIỆN CHI TIẾT SẢN PHẨM (Code tối giản - Dễ giải thích cho đồ án)
 * - Cột trái: Ảnh hoa lớn nổi bật
 * - Cột phải: Giá tiền, Mô tả hoa, Khung Lưu ý, 2 Nút Mua/Giỏ hàng, Nút Hotline và Khung 6 Ưu đãi
 */
export default function ProductDetail({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const toast = useToast();

  // 1. DỮ LIỆU SẢN PHẨM: Tên, Giá gốc, Giá khuyến mãi, Số lượng kho và Ảnh
  const name = product?.name || "Khuyến mãi - Hoa Tươi Nghệ Thuật";
  const price = Number(product?.price || 0);
  const salePrice = product?.salePrice ?? product?.sale_price;
  const hasSale = Boolean(salePrice && Number(salePrice) > 0 && Number(salePrice) < price);
  const currentPrice = hasSale ? Number(salePrice) : price;
  const stock = Number(product?.qty ?? 0); // Lấy số lượng tồn kho từ CSDL

  // Xử lý đường dẫn ảnh từ Backend Laravel
  const getImageUrl = (raw) => {
    if (!raw) return "/images/hoa.jpg";
    const s = String(raw).trim();
    if (s.startsWith("http") || s.startsWith("/images/")) return s;
    return `http://127.0.0.1:8000/storage/${s.replace(/^\/?storage\//, "").replace(/^\/+/, "")}`;
  };

  const mainImage = getImageUrl(product?.image);

  // 2. HÀM XỬ LÝ: Thêm vào giỏ hàng & Mua ngay
  const handleAddToCart = () => {
    if (stock <= 0) {
      toast.show("Sản phẩm hiện đã hết hàng!");
      return;
    }
    const item = { ...product, name, price, salePrice: hasSale ? currentPrice : null, image: mainImage };
    if (addToCart(item, 1)) {
      toast.show(`Đã thêm "${name}" vào giỏ hàng!`);
    }
  };

  const handleBuyNow = () => {
    if (stock <= 0) {
      toast.show("Sản phẩm hiện đã hết hàng!");
      return;
    }
    const item = { ...product, name, price, salePrice: hasSale ? currentPrice : null, image: mainImage };
    if (addToCart(item, 1)) {
      router.push("/cart");
    }
  };

  // 2. DỮ LIỆU TỪ CSDL: Danh mục, Thương hiệu, Mô tả
  const categoryName = product?.category?.name || "Chưa phân loại";
  const brandName = product?.brand?.name || "Đang cập nhật";
  const description = product?.description || "Hoa tươi cao cấp thiết kế nghệ thuật.";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 bg-white font-sans text-gray-800">
      <Toast message={toast.message} />

      {/* KHUNG NỘI DUNG 2 CỘT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* --- CỘT TRÁI: ẢNH HOA CHÍNH --- */}
        <div className="md:col-span-5">
          <div className="w-full aspect-[4/5] rounded border border-gray-200 overflow-hidden bg-white shadow-xs">
            <img
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "/images/hoa.jpg"; }}
            />
          </div>
        </div>

        {/* --- CỘT PHẢI: CHI TIẾT & BẢNG THÔNG TIN CSDL --- */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Tiêu đề đỏ */}
          <h1 className="text-xl sm:text-2xl font-bold text-[#c0392b] leading-tight">
            {name}
          </h1>

          {/* Hiển thị số lượng còn trong kho (Đơn giản, dễ hiểu) */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Kho hàng:</span>
            {stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Còn {stock} sản phẩm
              </span>
            ) : (
              <span className="font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                Hết hàng
              </span>
            )}
          </div>

          {/* Khung hiển thị Giá tiền */}
          <div>
            <div className="flex items-baseline gap-3">
              {hasSale && (
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  {price.toLocaleString("vi-VN")} đ
                </span>
              )}
              <span className="text-2xl sm:text-3xl font-extrabold text-[#c0392b]">
                {currentPrice.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <p className="text-xs text-gray-500 italic mt-0.5">
              Giá đã bao gồm 8% VAT - Sản phẩm hỗ trợ giao miễn phí khu vực gần (Chi tiết)
            </p>
          </div>

          <hr className="border-gray-200 my-2" />

          {/* Ghi chú sản phẩm tự nhiên */}
          <p className="italic text-gray-400 text-[11px] leading-relaxed">
            Sản phẩm thực nhận có thể khác với hình đại diện trên website (đặc điểm thủ công và tính chất tự nhiên của hoa tươi)
          </p>

          {/* Khung LƯU Ý (Viền xanh) */}
          <div className="border border-blue-200 rounded p-2.5 text-center text-xs space-y-1 bg-white">
            <p className="font-bold text-[#1e73be] uppercase tracking-wide">LƯU Ý</p>
            <p className="text-[#1e73be]">Sản phẩm bạn đang chọn là sản phẩm được thiết kế đặc biệt!</p>
            <p className="text-gray-600 text-[11px]">
              Hiện nay, shop hỗ trợ giao nhanh hỏa tốc trong 2 giờ tại tất cả khu vực nội thành.
            </p>
          </div>

          {/* Cụm 2 nút hành động: Thêm vào giỏ & Mua ngay */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className={`w-full py-2.5 rounded border font-bold text-sm transition ${
                stock <= 0
                  ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-[#f68b1f] text-[#f68b1f] hover:bg-orange-50 cursor-pointer active:scale-98"
              }`}
            >
              Thêm vào giỏ hàng
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={stock <= 0}
              className={`w-full py-2.5 rounded font-bold text-sm transition shadow ${
                stock <= 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#d63031] hover:bg-[#c0392b] text-white cursor-pointer active:scale-98"
              }`}
            >
              Mua ngay
            </button>
          </div>

          {/* Nút Hotline Xanh lá */}
          <a
            href="tel:18006353"
            className="flex items-center justify-center w-full py-2 rounded border border-[#27ae60] text-[#27ae60] hover:bg-green-50 font-bold text-sm transition"
          >
            Gọi ngay: 1800 6353
          </a>

          {/* Khung THÔNG TIN CHI TIẾT SẢN PHẨM (Dữ liệu kết nối 100% từ CSDL SQL) */}
          <div className="border border-blue-200 rounded p-3.5 space-y-2 bg-white">
            <p className="font-bold text-[#1e73be] text-xs uppercase text-center border-b border-blue-100 pb-1.5 tracking-wide">
              CHI TIẾT SẢN PHẨM
            </p>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Mã sản phẩm:</span>
                <span className="font-semibold text-gray-800">#SP-{String(product?.id || 0).padStart(4, "0")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Danh mục hoa:</span>
                <span className="font-semibold text-[#1e73be]">{categoryName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Thương hiệu / Xuất xứ:</span>
                <span className="font-semibold text-gray-800">{brandName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Số lượng trong kho:</span>
                <span className="font-semibold text-emerald-600">{stock} sản phẩm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Tình trạng:</span>
                <span className={`font-semibold ${stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  {stock > 0 ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>
              {description && (
                <div className="pt-1.5">
                  <span className="text-gray-500 font-medium block mb-1">Mô tả sản phẩm:</span>
                  <div className="text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-100 leading-relaxed whitespace-pre-line text-xs">
                    {description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SẢN PHẨM TƯƠNG TỰ */}
      <div className="mt-12 pt-6 border-t border-gray-100">
        <RelatedProducts
          currentProductId={product?.id}
          categoryId={product?.category?.id || product?.category_id}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
}
