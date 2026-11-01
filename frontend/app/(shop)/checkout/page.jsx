"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import API_CONFIG, { BANK_CONFIG } from "@/config/api";
import { Banknote, QrCode, CheckCircle, Loader2, Tag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { checkCoupon } from "@/services/saleServices";

// Hàm xử lý link ảnh hoa tươi từ Laravel Backend
function getImageUrl(raw) {
  if (!raw) return "/images/hoa.jpg";
  const str = String(raw).trim();
  if (!str) return "/images/hoa.jpg";
  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("blob:") || str.startsWith("/images/")) {
    return str;
  }
  const clean = str.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `http://127.0.0.1:8000/storage/${clean}`;
}

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

  // State mã khuyến mãi (lấy từ bảng productsale trong CSDL)
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ text: "", isError: false });

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

  // Tính tổng tiền tạm tính
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );
  // Tổng thanh toán thực tế sau khi trừ mã giảm giá
  const finalTotal = Math.max(0, totalPrice - discountAmount);

  const formatMoney = (val) => Number(val || 0).toLocaleString("vi-VN") + " đ";

  // Hàm kiểm tra và áp dụng mã khuyến mãi theo CSDL
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMsg({ text: "Vui lòng nhập mã khuyến mãi!", isError: true });
      return;
    }
    setCouponLoading(true);
    setCouponMsg({ text: "", isError: false });
    try {
      const res = await checkCoupon(couponCode.trim(), totalPrice);
      if (res?.valid) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(Number(res.discount_amount || 0));
        setCouponMsg({ text: res.message || "Áp dụng thành công!", isError: false });
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponMsg({ text: res?.message || "Mã không hợp lệ!", isError: true });
      }
    } catch (err) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponMsg({
        text: err.response?.data?.message || "Mã khuyến mãi không hợp lệ hoặc đã hết hạn!",
        isError: true,
      });
    } finally {
      setCouponLoading(false);
    }
  };

  // Hủy áp dụng mã
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponMsg({ text: "", isError: false });
  };

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
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discountAmount || 0,
        items: cartItems.map((item) => ({
          product_id: item.id,
          qty: item.qty || 1,
          price: item.price,
        })),
      };

      const res = await axios.post(`${API_CONFIG.BASE_URL}/orders`, payload);
      const newOrder = res.data.data;
      setCreatedOrder(newOrder);

      // Nếu COD thì hoàn tất luôn
      if (paymentMethod === "cod") {
        clearCart();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Đặt hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Giả lập thanh toán SePay thành công (để demo với giảng viên)
  const handleMockPayment = async () => {
    if (!createdOrder?.id) return;
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/sepay/mock-payment/${createdOrder.id}`);
      setIsPaid(true);
      clearCart();
      alert("Giả lập SePay: Chuyển khoản thành công!");
    } catch {
      alert("Lỗi giả lập SePay");
    }
  };

  // MÀN HÌNH 1: QUÉT MÃ VIETQR SEPAY
  if (createdOrder && paymentMethod === "qr") {
    const transferContent = `DH${createdOrder.id}`;
    const amount = createdOrder.total;
    const bankCode = BANK_CONFIG.BANK_CODE || "ACB";
    const accountNumber = BANK_CONFIG.ACCOUNT_NUMBER || BANK_CONFIG.BANK_ACCOUNT || "18900291";
    const accountName = BANK_CONFIG.ACCOUNT_NAME || "DAO DUY DUNG";
    const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&amount=${amount}&des=${transferContent}`;

    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-sm border border-gray-200 text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Thanh Toán VietQR (SePay)</h2>

          {isPaid ? (
            /* Khi SePay đã nhận tiền thành công */
            <div className="space-y-4 py-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-emerald-600">Thanh Toán Thành Công!</h3>
              <p className="text-xs text-gray-500">Đơn hàng #DH{createdOrder.id} đã được xác nhận thanh toán.</p>
              <div className="flex gap-2 pt-2">
                <Link href="/profile" className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded">
                  Xem đơn hàng
                </Link>
                <Link href="/" className="flex-1 py-2.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white text-xs font-bold rounded">
                  Về trang chủ
                </Link>
              </div>
            </div>
          ) : (
            /* Khi đang chờ khách quét QR */
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 text-blue-700 rounded text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang chờ chuyển khoản... Tự động nhận diện trong vài giây</span>
              </div>

              {/* Ảnh mã VietQR tạo động theo số tiền và mã đơn */}
              <div className="border p-3 rounded-xl inline-block bg-white shadow-xs">
                <img
                  src={qrUrl}
                  alt="VietQR SePay"
                  className="w-56 h-56 mx-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;
                  }}
                />
              </div>

              <div className="text-xs text-gray-600 space-y-1 text-left bg-gray-50 p-3 rounded-lg border">
                <p><strong>Ngân hàng:</strong> {BANK_CONFIG.BANK_NAME} ({bankCode})</p>
                <p><strong>Số tài khoản:</strong> <span className="font-mono font-bold text-gray-900">{accountNumber}</span></p>
                <p><strong>Chủ tài khoản:</strong> {accountName}</p>
                <div className="border-t pt-1 mt-1">
                  <p><strong>Số tiền:</strong> <span className="text-[#B83A63] font-bold text-sm">{formatMoney(amount)}</span></p>
                  <p><strong>Nội dung CK:</strong> <span className="text-blue-600 font-bold">{transferContent}</span></p>
                </div>
              </div>

              {/* Nút mô phỏng để test cho giảng viên xem */}
              <button
                type="button"
                onClick={handleMockPayment}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded cursor-pointer"
              >
                 Mô phỏng đã nhận tiền
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
            <Link href="/" className="flex-1 py-2.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white text-xs font-bold rounded">
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
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-800 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
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
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-800 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
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
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-800 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú đơn hàng</label>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-800 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                placeholder="Lời chúc trên thiệp hoặc yêu cầu đặc biệt..."
              />
            </div>

            {/* Chọn phương thức thanh toán */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Phương thức thanh toán</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`border p-3 rounded-lg flex items-center gap-2 cursor-pointer transition ${paymentMethod === "cod" ? "border-[#B83A63] bg-pink-50/40 text-[#B83A63]" : "border-gray-200 text-gray-700"}`}>
                  <input
                    type="radio"
                    name="method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-[#B83A63]"
                  />
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold">Tiền mặt (COD)</span>
                </label>

                <label className={`border p-3 rounded-lg flex items-center gap-2 cursor-pointer transition ${paymentMethod === "qr" ? "border-[#B83A63] bg-pink-50/40 text-[#B83A63]" : "border-gray-200 text-gray-700"}`}>
                  <input
                    type="radio"
                    name="method"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={() => setPaymentMethod("qr")}
                    className="accent-[#B83A63]"
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

            {/* DANH SÁCH HOA ĐÃ CHỌN MUA (Hiển thị ảnh, tên, số lượng, giá tiền) */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto space-y-2 pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-2 flex items-center gap-3">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    onError={(e) => { e.currentTarget.src = "/images/hoa.jpg"; }}
                    className="w-12 h-12 object-cover rounded-md border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {formatMoney(item.price)} x {item.qty || 1}
                    </p>
                  </div>
                  <span className="font-bold text-xs text-gray-800 shrink-0">
                    {formatMoney(Number(item.price || 0) * Number(item.qty || 1))}
                  </span>
                </div>
              ))}
            </div>

            {/* KHUNG NHẬP MÃ KHUYẾN MÃI (Dữ liệu từ bảng productsale) */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#B83A63]" />
                <span>Mã khuyến mãi / Giảm giá:</span>
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div>
                    <span className="font-bold text-emerald-700 uppercase">{appliedCoupon.code}</span>
                    <span className="text-emerald-600 block text-[11px] mt-0.5">
                      Giảm {formatMoney(discountAmount)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-500 hover:text-red-700 font-medium ml-2 cursor-pointer flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Hủy mã
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="VD: GIAM10, HOA20K"
                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 uppercase focus:outline-none focus:border-[#B83A63]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
                  >
                    {couponLoading ? "..." : "Áp dụng"}
                  </button>
                </div>
              )}

              {couponMsg.text && (
                <p className={`text-[11px] mt-1.5 ${couponMsg.isError ? "text-red-500" : "text-emerald-600 font-medium"}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* TỔNG THANH TOÁN */}
            <div className="border-t pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-semibold">{formatMoney(totalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Khuyến mãi ({appliedCoupon?.code}):</span>
                  <span>-{formatMoney(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-1.5 border-t border-gray-100">
                <span>Tổng thanh toán:</span>
                <span className="text-[#B83A63] text-base font-extrabold">{formatMoney(finalTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#B83A63] hover:bg-[#9E2F54] text-white text-xs font-bold rounded shadow-xs transition cursor-pointer"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
