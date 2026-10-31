"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Banknote,
  QrCode,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  ShoppingBag,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cartItems, clearCart, totalCount } = useCart();

  // 1. Phương thức thanh toán: "cod" (tiền mặt) hoặc "qr" (SePay tự động)
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // 2. Thông tin khách hàng nhận hoa
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isPaidSePay, setIsPaidSePay] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const pollTimerRef = useRef(null);

  // Tự động điền thông tin nếu đã đăng nhập tài khoản
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCustomerInfo((prev) => ({
          ...prev,
          name: u.name || "",
          phone: u.phone || "",
          address: u.address || "",
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  const getQty = (item) => Number(item.quantity ?? item.qty ?? 1);

  // Tính tổng tiền cần thanh toán
  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price || 0) * getQty(item),
    0
  );

  const formatMoney = (money) => {
    return Number(money || 0).toLocaleString("vi-VN") + " đ";
  };

  // KIỂM TRA TỰ ĐỘNG (POLLING): Liên tục hỏi Backend xem tiền SePay đã về chưa
  useEffect(() => {
    if (!createdOrder || !pollingActive || isPaidSePay) return;

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/orders/${createdOrder.id}/check-payment`
        );
        if (res.data?.payment_status === 1) {
          setIsPaidSePay(true);
          setPollingActive(false);
          clearCart();
          clearInterval(pollTimerRef.current);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra thanh toán SePay:", err);
      }
    }, 2500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [createdOrder, pollingActive, isPaidSePay, clearCart]);

  // Xử lý tạo đơn hàng khi bấm đặt hàng
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống! Vui lòng chọn hoa vào giỏ trước khi thanh toán.");
      return;
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!");
      return;
    }

    setSubmitting(true);
    try {
      // Lấy user_id nếu có
      let userId = null;
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) userId = JSON.parse(savedUser)?.id;
      } catch {
        // ignore
      }

      const payload = {
        user_id: userId ? Number(userId) : null,
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        address: customerInfo.address.trim(),
        note: customerInfo.note?.trim() || null,
        payment_method: paymentMethod, // "cod" hoặc "qr"
        payment_status: 0,
        items: cartItems.map((item) => ({
          product_id: Number(item.id || item.product_id),
          qty: Math.max(1, Number(getQty(item)) || 1),
          price: Number(item.price || 0),
        })),
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post("http://127.0.0.1:8000/api/orders", payload, { headers });
      const newOrder = res.data?.data || res.data || { id: 1, total: totalPrice };
      setCreatedOrder(newOrder);

      // Nếu là thanh toán tiền mặt (COD) -> Hoàn tất ngay
      if (paymentMethod === "cod") {
        clearCart();
        setOrderSuccess(true);
      } else {
        // Nếu là thanh toán tự động SePay -> Kích hoạt trạng thái chờ ngân hàng nhận tiền
        setPollingActive(true);
      }
    } catch (err) {
      console.warn("Lỗi gửi đơn hàng:", err);
      const apiMsg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" - ") : null);
      alert(apiMsg || "Có lỗi khi tạo đơn hàng, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  // Nút test: Mô phỏng SePay xác nhận chuyển tiền thành công
  const handleSimulatePayment = async () => {
    if (!createdOrder?.id) return;
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/sepay/mock-payment/${createdOrder.id}`
      );
      setIsPaidSePay(true);
      setPollingActive(false);
      clearCart();
    } catch {
      setIsPaidSePay(true);
      clearCart();
    }
  };

  // =========================================================================
  // GIAO DIỆN 1: MÀN HÌNH CHỜ QUÉT MÃ SEPAY & TỰ ĐỘNG BÁO KHI NHẬN TIỀN
  // =========================================================================
  if (createdOrder && paymentMethod === "qr" && !orderSuccess) {
    const orderId = createdOrder.id;
    const finalAmount = createdOrder.total || totalPrice;
    const transferContent = `HOA ${orderId}`;
    const qrUrl = `https://img.vietqr.io/image/ACB-18900291-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(
      transferContent
    )}&accountName=DAO%20DUY%20DUNG`;

    return (
      <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
          
          {/* Trạng thái 1: ĐÃ NHẬN TIỀN THÀNH CÔNG */}
          {isPaidSePay ? (
            <div className="text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-1">
                  SePay Tự Động Xác Nhận
                </span>
                <h2 className="text-2xl font-black text-gray-800">
                  Thanh Toán Thành Công!
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ngân hàng đã nhận đủ số tiền <strong>{formatMoney(finalAmount)}</strong> cho đơn hàng <strong>#DH{orderId}</strong>.
                </p>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl text-xs text-left space-y-1.5 border border-emerald-100 text-emerald-950">
                <p><strong>Mã đơn hàng:</strong> #DH{orderId}</p>
                <p><strong>Người nhận:</strong> {customerInfo.name} ({customerInfo.phone})</p>
                <p><strong>Địa chỉ:</strong> {customerInfo.address}</p>
                <p><strong>Trạng thái:</strong> Đã thanh toán tự động qua SePay</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/profile"
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition text-center"
                >
                  Xem đơn hàng của tôi
                </Link>
                <Link
                  href="/"
                  className="flex-1 py-3 bg-[#f68b1f] hover:bg-[#e67300] text-white text-xs font-bold rounded-xl transition text-center"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          ) : (
            /* Trạng thái 2: ĐANG CHỜ QUÉT MÃ VÀ NHẬN TIỀN */
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang chờ chuyển khoản SePay...</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Quét Mã Để Thanh Toán Tự Động
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Hệ thống tự động kích hoạt ngay khi ngân hàng nhận được tiền
                </p>
              </div>

              {/* Khung mã QR VietQR */}
              <div className="bg-orange-50/60 border border-orange-200 p-4 rounded-2xl flex flex-col items-center">
                <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm border border-orange-100 flex items-center justify-center">
                  <img
                    src={qrUrl}
                    alt="VietQR SePay"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Thông tin chuyển khoản */}
                <div className="w-full mt-4 bg-white p-3.5 rounded-xl border border-orange-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngân hàng:</span>
                    <strong className="text-gray-800">ACB (Ngân hàng Á Châu)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số tài khoản:</span>
                    <strong className="text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                      18900291
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chủ tài khoản:</span>
                    <strong className="text-gray-800">DAO DUY DUNG</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số tiền:</span>
                    <strong className="text-[#d32f2f] text-sm">
                      {formatMoney(finalAmount)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg">
                    <span className="text-blue-800 font-medium">Nội dung CK:</span>
                    <strong className="text-blue-700 font-mono text-sm tracking-wide">
                      {transferContent}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Thông báo lắng nghe tiền về */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Hệ thống SePay tự động lắng nghe tài khoản mỗi 2 giây...</span>
              </div>

              {/* Nút hỗ trợ test nhanh khi báo cáo / demo */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mô phỏng ngân hàng nhận được tiền (Test Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setOrderSuccess(true);
                  }}
                  className="w-full py-2 text-gray-500 hover:text-gray-800 text-xs font-medium"
                >
                  Tôi đã chuyển khoản xong, xem đơn hàng
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN 2: MÀN HÌNH ĐẶT HÀNG TIỀN MẶT THÀNH CÔNG (COD)
  // =========================================================================
  if (orderSuccess) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-md w-full rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Đặt Hàng Thành Công!
          </h2>
          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            Cảm ơn quý khách đã tin tưởng <strong>Shop Hoa Yêu Thương</strong>. Đơn hàng của bạn đã được ghi nhận. Shipper sẽ liên hệ giao hoa tận nơi và thu tiền mặt.
          </p>

          <div className="bg-gray-50 p-4 rounded-xl text-xs text-left mb-6 space-y-1.5 text-gray-700 border border-gray-100">
            <p><strong>Người nhận:</strong> {customerInfo.name} ({customerInfo.phone})</p>
            <p><strong>Địa chỉ:</strong> {customerInfo.address}</p>
            <p><strong>Hình thức:</strong> Thanh toán tiền mặt khi nhận hàng (COD)</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/profile"
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition text-center"
            >
              Xem đơn hàng
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 bg-[#f68b1f] hover:bg-[#e67300] text-white text-xs font-bold rounded-xl transition text-center"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // NẾU GIỎ HÀNG KHÔNG CÓ MÓN NÀO
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 bg-gray-50 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-200 text-center max-w-md w-full">
          <ShoppingBag className="w-14 h-14 mx-auto text-gray-300 mb-3" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.
          </p>
          <Link
            href="/"
            className="inline-block py-2.5 px-6 bg-[#f68b1f] text-white text-xs font-semibold rounded-lg"
          >
            Chọn hoa tươi ngay
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN 3: FORM NHẬP THÔNG TIN VÀ CHỌN PHƯƠNG THỨC THANH TOÁN
  // =========================================================================
  return (
    <div className="min-h-[75vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#f68b1f] font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại giỏ hàng</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Thanh Toán Đơn Hàng ({totalCount} sản phẩm)
        </h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN & CHỌN PHƯƠNG THỨC THANH TOÁN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. THÔNG TIN GIAO HÀNG */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase border-b pb-2">
                1. Thông tin người nhận hoa
              </h2>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Họ và tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    placeholder="VD: 0987654321"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ghi chú giao hàng
                  </label>
                  <input
                    type="text"
                    value={customerInfo.note}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        note: e.target.value,
                      })
                    }
                    placeholder="VD: Giao trước 10h sáng"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Địa chỉ giao hoa tận nơi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      address: e.target.value,
                    })
                  }
                  placeholder="VD: 123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                />
              </div>
            </div>

            {/* 2. CHỌN HÌNH THỨC THANH TOÁN (TIỀN MẶT HOẶC SEPAY TỰ ĐỘNG) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase border-b pb-2">
                2. Chọn phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {/* LỰA CHỌN 1: THANH TOÁN TIỀN MẶT */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#f68b1f] bg-orange-50/50 shadow-xs ring-1 ring-[#f68b1f]"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1 text-[#f68b1f] focus:ring-[#f68b1f]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-bold text-gray-800">
                        Thanh toán tiền mặt khi nhận hàng (COD)
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Thanh toán trực tiếp bằng tiền mặt cho nhân viên giao hàng khi nhận hoa.
                    </p>
                  </div>
                </label>

                {/* LỰA CHỌN 2: THANH TOÁN TỰ ĐỘNG QUA SEPAY */}
                <label
                  onClick={() => setPaymentMethod("qr")}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "qr"
                      ? "border-[#f68b1f] bg-orange-50/50 shadow-xs ring-1 ring-[#f68b1f]"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "qr"}
                    onChange={() => setPaymentMethod("qr")}
                    className="mt-1 text-[#f68b1f] focus:ring-[#f68b1f]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-[#f68b1f]" />
                      <span className="text-sm font-bold text-gray-800">
                        Thanh toán tự động qua SePay (VietQR 24/7)
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                        Tự động xác nhận
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Quét mã QR qua app ngân hàng, hệ thống SePay tự động phát hiện tiền về và duyệt thanh toán tức thì.
                    </p>
                  </div>
                </label>
              </div>

            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & NÚT ĐẶT HÀNG */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs h-fit space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase border-b pb-2">
              Đơn hàng của bạn
            </h2>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto text-xs space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-2 flex justify-between gap-2">
                  <span className="text-gray-700 line-clamp-1">
                    {item.name} x {getQty(item)}
                  </span>
                  <span className="font-semibold text-gray-800 shrink-0">
                    {formatMoney(Number(item.price || 0) * getQty(item))}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-semibold text-gray-800">
                  {formatMoney(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí giao hàng:</span>
                <span className="font-semibold text-emerald-600">Miễn phí</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-800">Tổng cộng:</span>
                <span className="text-lg font-bold text-[#d32f2f]">
                  {formatMoney(totalPrice)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#f68b1f] hover:bg-[#e67300] disabled:bg-gray-400 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {submitting
                  ? "Đang xử lý..."
                  : paymentMethod === "qr"
                  ? "Lấy mã QR thanh toán SePay"
                  : "Xác nhận đặt hàng tiền mặt"}
              </span>
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Cam kết hoa tươi 100% & giao đúng thời gian
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
