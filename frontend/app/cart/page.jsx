"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
export default function CartPage() {
    // Lấy giỏ hàng từ localStorage khi vừa vào trang
    const [cartItems, setCartItems] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("cart");
                if (saved) {
                    return JSON.parse(saved);
                }
            }
            catch {
                return [];
            }
        }
        // Dữ liệu mẫu ban đầu để sinh viên dễ test giao diện
        return [
            {
                id: 1,
                name: "Bó Hoa Hướng Dương Rực Rỡ",
                price: 350000,
                image: "/images/434427_hoa-cat-canh.png",
                qty: 1,
            },
            {
                id: 2,
                name: "Hộp Hoa Hồng Đỏ Tình Yêu",
                price: 490000,
                image: "/images/434454_only-rose.png",
                qty: 2,
            },
        ];
    });
    // Hàm lưu giỏ hàng mới vào state và localStorage
    const saveCart = (newItems) => {
        setCartItems(newItems);
        localStorage.setItem("cart", JSON.stringify(newItems));
    };
    // Tăng hoặc giảm số lượng món hàng
    const handleUpdateQty = (id, delta) => {
        const updated = cartItems
            .map((item) => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : null;
            }
            return item;
        })
            .filter((item) => item !== null);
        saveCart(updated);
    };
    // Xóa 1 món hàng ra khỏi giỏ
    const handleRemoveItem = (id) => {
        if (confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            const updated = cartItems.filter((item) => item.id !== id);
            saveCart(updated);
        }
    };
    // Xóa toàn bộ giỏ hàng
    const handleClearCart = () => {
        if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
            saveCart([]);
        }
    };
    // Xử lý khi bấm Đặt hàng
    const handleCheckout = () => {
        alert("Cảm ơn bạn! Đơn hàng đã được ghi nhận thành công.");
        saveCart([]);
    };
    // Tính tổng tiền giỏ hàng
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
    // Định dạng hiển thị tiền VNĐ (VD: 350.000 đ)
    const formatMoney = (money) => {
        return money.toLocaleString("vi-VN") + " đ";
    };
    return (<div className="min-h-[75vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Tiêu đề trang */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Giỏ Hàng Của Bạn ({cartItems.reduce((sum, item) => sum + item.qty, 0)})
          </h1>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#f68b1f] font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5"/>
            <span>Tiếp tục mua hàng</span>
          </Link>
        </div>

        {/* NẾU GIỎ HÀNG TRỐNG */}
        {cartItems.length === 0 ? (<div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-xs">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-3"/>
            <h2 className="text-lg font-semibold text-gray-700">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Hãy chọn cho mình những bó hoa tươi đẹp nhất nhé!
            </p>
            <Link href="/" className="inline-block py-2.5 px-6 bg-[#f68b1f] hover:bg-[#e67300] text-white text-xs font-semibold rounded transition-colors">
              Khám phá sản phẩm
            </Link>
          </div>) : (
        /* NẾU CÓ SẢN PHẨM TRONG GIỎ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: Bảng danh sách sản phẩm */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-xs font-bold text-gray-700 uppercase">
                  Sản phẩm trong giỏ
                </span>
                <button type="button" onClick={handleClearCart} className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer">
                  Xóa tất cả
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (<div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Ảnh & Tên sản phẩm */}
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? (<Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-contain"/>) : (<ShoppingBag className="w-6 h-6 text-gray-400"/>)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#f68b1f] font-bold mt-0.5">
                          {formatMoney(item.price)}
                        </p>
                      </div>
                    </div>

                    {/* Bộ tăng/giảm số lượng + Thành tiền + Nút xóa */}
                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      {/* Tăng / giảm số lượng */}
                      <div className="flex items-center border border-gray-300 rounded">
                        <button type="button" onClick={() => handleUpdateQty(item.id, -1)} className="p-1.5 hover:bg-gray-100 text-gray-600 cursor-pointer" title="Giảm 1">
                          <Minus className="w-3 h-3"/>
                        </button>
                        <span className="px-3 text-xs font-semibold text-gray-800">
                          {item.qty}
                        </span>
                        <button type="button" onClick={() => handleUpdateQty(item.id, 1)} className="p-1.5 hover:bg-gray-100 text-gray-600 cursor-pointer" title="Tăng 1">
                          <Plus className="w-3 h-3"/>
                        </button>
                      </div>

                      {/* Thành tiền */}
                      <span className="text-sm font-bold text-gray-800 min-w-[90px] text-right">
                        {formatMoney(item.price * item.qty)}
                      </span>

                      {/* Nút xóa */}
                      <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors" title="Xóa món này">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>))}
              </div>
            </div>

            {/* Cột phải: Khung tổng thanh toán */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs h-fit space-y-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-100 pb-2">
                Tóm Tắt Đơn Hàng
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-gray-800">
                    {formatMoney(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng:</span>
                  <span className="font-semibold text-emerald-600">
                    Miễn phí
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-800">Tổng cộng:</span>
                <span className="text-lg font-bold text-[#d32f2f]">
                  {formatMoney(totalPrice)}
                </span>
              </div>

              {/* Nút đặt hàng */}
              <button type="button" onClick={handleCheckout} className="w-full py-3 bg-[#f68b1f] hover:bg-[#e67300] active:scale-[0.99] text-white font-bold text-xs rounded transition-all cursor-pointer shadow-sm uppercase tracking-wide">
                Tiến hành thanh toán
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Cam kết hoa tươi 100% & giao nhanh đúng hẹn
              </p>
            </div>
          </div>)}
      </div>
    </div>);
}
