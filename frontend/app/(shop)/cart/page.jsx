"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import API_CONFIG from "@/config/api";

function CartItemImage({ item, image, name }) {
  const getImageUrl = (raw) => {
    if (!raw) return "/images/hoa.jpg";
    const str = String(raw).trim();
    if (!str) return "/images/hoa.jpg";
    if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("blob:") || str.startsWith("/images/")) {
      return str;
    }
    const clean = str.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://127.0.0.1:8000/storage/${clean}`;
  };

  const rawImg = image || item?.image || item?.thumbnail || item?.image_url;
  const [src, setSrc] = useState(() => getImageUrl(rawImg));

  return (
    <img
      src={src}
      alt={name || item?.name || "Hoa tươi"}
      onError={() => setSrc("/images/hoa.jpg")}
      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-gray-100 shrink-0"
    />
  );
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalCount } = useCart();

  // Tính tổng tiền
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );

  const formatMoney = (val) => Number(val || 0).toLocaleString("vi-VN") + " đ";

  return (
    <div className="min-h-[75vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Giỏ Hàng Của Bạn ({totalCount})
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#f68b1f] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tiếp tục mua hàng</span>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-xs">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <h2 className="text-lg font-semibold text-gray-700">Giỏ hàng của bạn đang trống</h2>
            <p className="text-xs text-gray-500 mt-1 mb-6">Hãy chọn cho mình những bó hoa tươi đẹp nhất nhé!</p>
            <Link
              href="/"
              className="inline-block py-2.5 px-6 bg-[#f68b1f] hover:bg-[#e67300] text-white text-xs font-semibold rounded"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-xs font-bold text-gray-700 uppercase">Sản phẩm trong giỏ</span>
                <button
                  type="button"
                  onClick={() => confirm("Xóa toàn bộ giỏ hàng?") && clearCart()}
                  className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <CartItemImage item={item} image={item.image} name={item.name} />
                      <div className="min-w-0">
                        <Link href={`/products/${item.slug || item.id}`} className="text-sm font-semibold text-gray-800 hover:text-[#f68b1f] line-clamp-1">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-[#d32f2f] font-bold">
                            {formatMoney(item.price)}
                          </p>
                          {item.originalPrice && (
                            <span className="text-[11px] text-gray-400 line-through">
                              {formatMoney(item.originalPrice)}
                            </span>
                          )}
                        </div>
                        {item.stock !== undefined && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Kho còn: <span className="font-medium text-gray-600">{item.stock}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Tăng giảm số lượng (có kiểm tra tồn kho) */}
                      <div className="flex items-center border border-gray-200 rounded">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Number(item.qty || 1) - 1)}
                          className="p-1 hover:bg-gray-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold">{item.qty || 1}</span>
                        {/* Nút cộng: tự khóa nếu số lượng đã chạm giới hạn kho */}
                        <button
                          type="button"
                          disabled={item.stock !== undefined && Number(item.qty || 1) >= Number(item.stock)}
                          onClick={() => updateQuantity(item.id, Number(item.qty || 1) + 1)}
                          className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title={item.stock !== undefined && Number(item.qty || 1) >= Number(item.stock) ? "Đã đạt số lượng tồn kho tối đa" : "Tăng số lượng"}
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-5 space-y-4 h-fit">
              <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 uppercase">
                Tóm tắt đơn hàng
              </h2>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-semibold text-gray-800">{formatMoney(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-3">
                <span>Tổng tiền:</span>
                <span className="text-[#d32f2f] text-base">{formatMoney(totalPrice)}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3 bg-[#f68b1f] hover:bg-[#e67300] text-white text-xs font-bold rounded flex items-center justify-center gap-2 shadow-xs transition"
              >
                <span>Tiến hành thanh toán</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
