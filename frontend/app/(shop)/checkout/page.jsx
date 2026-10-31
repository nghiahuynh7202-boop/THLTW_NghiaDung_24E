"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import API_CONFIG, { BANK_CONFIG } from "@/config/api";
import { Banknote, QrCode, CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();

  // State phương thức thanh toán: "cod" hoặc "qr" (SePay)
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // State thông tin người nhận
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  // Tự động điền thông tin nếu đã đăng nhập
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setForm((prev) => ({
          ...prev,
          name: u.name || "",
          phone: u.phone || "",
          address: u.address || "",
        }));
      }
    } catch {}
  }, []);

  // Tính tổng tiền
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );
  const formatMoney = (val) => Number(val || 0).toLocaleString("vi-VN") + " đ";

  // Polling: Kiểm tra trạng thái thanh toán SePay mỗi 3 giây
  useEffect(() => {
    if (!createdOrder?.id || paymentMethod !== "qr" || isPaid) return;

    const timer = setInterval(async () => {
      try {
        const res = await axios.get(`${API_CONFIG.BASE_URL}/orders/${createdOrder.id}/check-payment`);
        if (res.data?.payment_status === 1) {
          setIsPaid(true);
          clearCart();
          clearInterval(timer);
        }
      } catch (err) {
        console.error("Lỗi polling SePay:", err);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [createdOrder, paymentMethod, isPaid, clearCart]);

  // Xử lý đặt hàng
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    if (!form.name || !form.phone || !form.address) {
      alert("Vui lòng điền đầy đủ Tên, SĐT và Địa chỉ nhận hoa!");
      return;
    }

    setLoading(true);
    try {
      let userId = null;
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        userId = u.id || null;
      } catch {}

      const payload = {
        user_id: userId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note?.trim() || null,
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.id,
          qty: item.qty || 1,
          price: item.price,
        })),
      };

      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(`${API_CONFIG.BASE_URL}/orders`, payload, { headers });
      const order = res.data?.data || res.data;
      setCreatedOrder(order);

      // Nếu chọn COD thì xong luôn và xóa giỏ
      if (paymentMethod === "cod") {
        clearCart();
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Đặt hàng thất bại"));
    } finally {
      setLoading(false);
    }
  };

  // Nút mô phỏng thanh toán SePay khi báo cáo cô
  const handleMockPayment = async () => {
    if (!createdOrder?.id) return;
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/sepay/mock-payment/${createdOrder.id}`);
      setIsPaid(true);
      clearCart();
    } catch {
      setIsPaid(true);
      clearCart();
    }
  };

  // MÀN HÌNH 1: QUÉT MÃ QR SEPAY
  if (createdOrder && paymentMethod === "qr") {
    const orderId = createdOrder.id;
    const finalAmount = createdOrder.total || totalPrice;
    const transferContent = `HOA ${orderId}`;
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_NAME}-${BANK_CONFIG.BANK_ACCOUNT}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-sm border border-gray-200 text-center space-y-4">
          {isPaid ? (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Thanh Toán Thành Công!</h2>
              <p className="text-xs text-gray-500">Đơn hàng #DH{orderId} đã được tự động xác nhận.</p>
              <div className="flex gap-2 pt-2">
                <Link href="/profile" className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                  Xem đơn hàng
                </Link>
                <Link href="/" className="flex-1 py-2.5 bg-[#f68b1f] text-white text-xs font-bold rounded">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang chờ chuyển khoản SePay...</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Quét mã VietQR để thanh toán</h2>

              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex flex-col items-center">
                <img src={qrUrl} alt="VietQR" className="w-48 h-48 object-contain bg-white p-2 rounded shadow-xs" />
                <div className="w-full mt-3 text-xs text-left space-y-1 text-gray-600">
                  <p><strong>Ngân hàng:</strong> {BANK_CONFIG.BANK_NAME}</p>
                  <p><strong>Số tài khoản:</strong> {BANK_CONFIG.BANK_ACCOUNT}</p>
                  <p><strong>Chủ tài khoản:</strong> {BANK_CONFIG.ACCOUNT_NAME}</p>
                  <p><strong>Số tiền:</strong> <span className="text-[#d32f2f] font-bold">{formatMoney(finalAmount)}</span></p>
                  <p><strong>Nội dung CK:</strong> <span className="text-blue-600 font-bold">{transferContent}</span></p>
                </div>
              </div>

              {/* Nút mô phỏng để test cho giảng viên xem */}
              <button
                type="button"
                onClick={handleMockPayment}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded cursor-pointer"
              >
                ⚡ Mô phỏng đã nhận tiền (Báo cáo cô)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MÀN HÌNH 2: ĐẶT HÀNG COD THÀNH CÔNG
  if (createdOrder && paymentMethod === "cod") {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-sm border border-gray-200 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Đặt Hàng Thành Công!</h2>
          <p className="text-xs text-gray-500">Mã đơn hàng: #DH{createdOrder.id} - Thanh toán khi nhận hàng (COD).</p>
          <div className="flex gap-2 pt-2">
            <Link href="/profile" className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">
              Xem đơn hàng
            </Link>
            <Link href="/" className="flex-1 py-2.5 bg-[#f68b1f] text-white text-xs font-bold rounded">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH 3: FORM ĐIỀN THÔNG TIN ĐẶT HÀNG
  return (
    <div className="min-h-[80vh] bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Thanh Toán Đơn Hàng</h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột thông tin khách hàng */}
          <div className="md:col-span-2 bg-white p-5 sm:p-6 rounded-xl border border-gray-200 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase border-b pb-2">Thông tin nhận hoa</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded p-2 text-xs"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded p-2 text-xs"
                placeholder="0901234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ giao hàng *</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-200 rounded p-2 text-xs"
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú đơn hàng</label>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full border border-gray-200 rounded p-2 text-xs"
                placeholder="Lời chúc trên thiệp hoặc yêu cầu đặc biệt..."
              />
            </div>

            {/* Chọn phương thức thanh toán */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Phương thức thanh toán</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`border p-3 rounded-lg flex items-center gap-2 cursor-pointer ${paymentMethod === "cod" ? "border-[#f68b1f] bg-orange-50/20" : "border-gray-200"}`}>
                  <input
                    type="radio"
                    name="method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold">Tiền mặt (COD)</span>
                </label>

                <label className={`border p-3 rounded-lg flex items-center gap-2 cursor-pointer ${paymentMethod === "qr" ? "border-[#f68b1f] bg-orange-50/20" : "border-gray-200"}`}>
                  <input
                    type="radio"
                    name="method"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={() => setPaymentMethod("qr")}
                  />
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold">Quét mã VietQR</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cột tóm tắt đơn hàng */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 h-fit">
            <h2 className="text-sm font-bold text-gray-700 uppercase border-b pb-2">Đơn hàng của bạn</h2>

            <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto text-xs space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-2 flex justify-between">
                  <span className="line-clamp-1 flex-1 pr-2">{item.name} x {item.qty || 1}</span>
                  <span className="font-semibold text-gray-800">{formatMoney(Number(item.price || 0) * Number(item.qty || 1))}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-sm">
              <span>Tổng thanh toán:</span>
              <span className="text-[#d32f2f] text-base">{formatMoney(totalPrice)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#f68b1f] hover:bg-[#e67300] text-white text-xs font-bold rounded shadow-xs transition cursor-pointer"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
