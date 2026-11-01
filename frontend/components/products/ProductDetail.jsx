"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Zap,
  Phone,
  Truck,
  Camera,
  Gift,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/home/Toast";
import { useToast } from "@/hooks/useToast";
import RelatedProducts from "./RelatedProducts";

function formatPrice(amount) {
  return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + "đ";
}

export default function ProductDetail({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const toast = useToast();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");

  const name = product?.name || product?.product_name || "Sản phẩm hoa tươi";
  // Thống nhất cách tính giá: price luôn là giá gốc, salePrice là giá sau giảm
  const price = Number(product?.price || 0);
  const salePrice =
    product?.salePrice !== undefined && product?.salePrice !== null
      ? Number(product.salePrice)
      : (product?.sale_price ? Number(product.sale_price) : null);
  const hasSale = Boolean(salePrice !== null && salePrice > 0 && salePrice < price);
  const currentPrice = hasSale ? salePrice : price; // Giá phải trả
  const discountPercent = hasSale ? Math.round(((price - salePrice) / price) * 100) : 0;

  const rawImage = product?.image || "";
  const [hasImgError, setHasImgError] = useState(false);
  const getImageUrl = (raw) => {
    if (!raw) return "";
    const s = String(raw).trim();
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:") || s.startsWith("/images/")) {
      return s;
    }
    const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
    const clean = s.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://${hostname}:8000/storage/${clean}`;
  };
  const imgSrc = getImageUrl(rawImage);

  const categoryName = product?.category?.name || product?.category_name || "Hoa tươi";
  const categoryId = product?.category?.id || product?.category_id || product?.cat_id;
  const description = product?.description || "Sản phẩm hoa tươi tuyển chọn từ các nhà vườn uy tín, được thiết kế tỉ mỉ bởi các nghệ nhân cắm hoa giàu kinh nghiệm. Mang đến món quà trọn vẹn tình cảm cho người nhận.";

  const handleQuantity = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      id: product?.id,
      name,
      price,
      salePrice: hasSale ? salePrice : null,
      image: rawImage || "",
    };
    const ok = addToCart(itemToAdd, quantity);
    if (ok) {
      toast.show(`Đã thêm ${quantity} x "${name}" vào giỏ hàng!`);
    }
  };

  const handleAddRelatedToCart = (item) => {
    const ok = addToCart(item, 1);
    if (ok) {
      toast.show(`Đã thêm "${item.name}" vào giỏ hàng!`);
    }
  };

  const handleBuyNow = () => {
    const itemToAdd = {
      ...product,
      id: product?.id,
      name,
      price,
      salePrice: hasSale ? salePrice : null,
      image: rawImage || "",
    };
    const ok = addToCart(itemToAdd, quantity);
    if (ok) {
      router.push("/cart");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 font-sans">
      <Toast message={toast.message} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/products" className="hover:text-blue-600 transition-colors">
          Sản phẩm
        </Link>
        {categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link
              href={`/products?category=${categoryId || ""}`}
              className="hover:text-blue-600 transition-colors"
            >
              {categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-800 font-semibold truncate max-w-xs">
          {name}
        </span>
      </nav>

      {/* Main Product Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-8 lg:p-10 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* CỘT TRÁI: HÌNH ẢNH */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-[4/4.8] w-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs flex items-center justify-center group">
              {!imgSrc || hasImgError ? (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-16 h-16 text-gray-300" />
                </div>
              ) : (
                <img
                  src={imgSrc}
                  alt={name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={() => setHasImgError(true)}
                />
              )}

              {discountPercent > 0 && (
                <span className="absolute top-3.5 left-3.5 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Tiện ích cam kết dưới ảnh */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-500 pt-1">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-1">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Chụp ảnh xác nhận</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Giao nhanh 60-120p</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-1">
                <Gift className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Tặng thiệp, banner</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  {categoryName}
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Còn hàng (Sẵn sàng giao)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                {name}
              </h1>

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>Mã SP: <strong className="text-gray-800">SP-{product?.id || "001"}</strong></span>
                {product?.brand?.name && (
                  <span>Thương hiệu: <strong className="text-gray-800">{product.brand.name}</strong></span>
                )}
              </div>
            </div>

            {/* Khung giá */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/70 to-amber-50/40 border border-orange-100/80 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#ff3d00] tracking-tight">
                {formatPrice(currentPrice)}
              </span>
              {hasSale && (
                <span className="text-sm sm:text-base text-gray-400 line-through font-normal">
                  {formatPrice(price)}
                </span>
              )}
              {hasSale && discountPercent > 0 && (
                <span className="text-xs font-bold text-red-600 bg-red-100/80 px-2.5 py-0.5 rounded-full">
                  Tiết kiệm {discountPercent}%
                </span>
              )}
            </div>

            {/* Chọn số lượng */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Số lượng đặt:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => handleQuantity(-1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-800 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantity(1)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Tạm tính: <strong className="text-gray-800 text-sm">{formatPrice(currentPrice * quantity)}</strong>
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-bold text-sm transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm vào giỏ hàng</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Mua ngay</span>
              </button>
            </div>

            {/* Hotline tư vấn */}
            <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/80 flex items-center justify-between text-xs">
              <span className="text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Cần thiết kế mẫu hoa riêng theo yêu cầu?
              </span>
              <a
                href="tel:19001234"
                className="font-bold text-blue-600 hover:text-blue-700 underline"
              >
                1900 1234 (Miễn phí)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs nội dung chi tiết */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8">
        <div className="flex border-b border-gray-100 gap-6 sm:gap-8 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("desc")}
            className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "desc"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("care")}
            className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "care"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Chăm sóc hoa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("policy")}
            className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === "policy"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Chính sách giao nhận
          </button>
        </div>

        {activeTab === "desc" && (
          <div className="prose max-w-none text-sm text-gray-600 leading-relaxed space-y-4">
            <p>{description}</p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-2 mt-4">
              <p className="font-bold text-gray-800">Lưu ý về sản phẩm:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Sản phẩm hoa cắm thủ công nên hình ảnh thực tế có thể chênh lệch nhẹ tùy thuộc vào đợt hoa và phụ liệu theo mùa.</li>
                <li>Trước khi giao hàng, nhân viên sẽ chụp ảnh hoàn thiện gửi qua Zalo/Email để quý khách duyệt trước.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "care" && (
          <div className="text-sm text-gray-600 leading-relaxed space-y-3">
            <p className="font-semibold text-gray-800">Bí quyết giữ hoa tươi lâu:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li>Đặt hoa ở nơi thoáng mát, tránh ánh nắng trực tiếp và luồng gió từ máy lạnh thổi trực diện.</li>
              <li>Đối với hoa cắm xốp (oasis): Châm thêm nước mát vào xốp mỗi ngày từ 100 - 200ml.</li>
              <li>Đối với hoa bó cắm bình: Cắt vát gốc 45 độ và thay nước sạch mỗi ngày một lần.</li>
            </ul>
          </div>
        )}

        {activeTab === "policy" && (
          <div className="text-sm text-gray-600 leading-relaxed space-y-3">
            <p className="font-semibold text-gray-800">Cam kết giao hàng & đổi trả:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
              <li>Miễn phí giao hàng nội thành cho đơn hàng từ 500.000đ.</li>
              <li>Giao hàng đúng hẹn theo khung giờ đã thỏa thuận với khách hàng.</li>
              <li>Cam kết 100% đổi mới hoặc hoàn tiền nếu hoa bị dập nát, héo úa hoặc không đúng mẫu yêu cầu.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Sản phẩm liên quan */}
      <RelatedProducts
        currentProductId={product?.id}
        categoryId={categoryId}
        onAddToCart={handleAddRelatedToCart}
      />
    </div>
  );
}
