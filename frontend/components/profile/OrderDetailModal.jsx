"use client";

import { useState } from "react";
import axios from "axios";
import API_CONFIG from "@/config/api";
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";

// Hàm xử lý link ảnh hoa tươi
const layLinkAnh = (rawImg) => {
  const raw = rawImg ? String(rawImg).trim() : "";
  if (!raw) return "/images/hoa.jpg";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/images/")) {
    return raw;
  }
  const clean = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `${API_CONFIG.ROOT_URL}/storage/${clean}`;
};

/**
 * MODAL CHI TIẾT ĐƠN HÀNG
 * - Tách thành component riêng để file Profile ngắn gọn, dễ hiểu.
 * - Bấm "Xem chi tiết" thì bật lên, bấm nút "Đóng" hoặc dấu "X" thì biến mất.
 */
export default function OrderDetailModal({ order, onClose, onCancelSuccess }) {
  const [dangHuy, setDangHuy] = useState(false);

  if (!order) return null;

  // Định dạng tiền VNĐ
  const dinhDangTien = (val) => Number(val || 0).toLocaleString("vi-VN") + " đ";

  // Hàm trả về màu sắc & nhãn trạng thái đơn
  const layTrangThai = (status) => {
    switch (Number(status)) {
      case 1:
        return { text: "Chờ xác nhận", color: "bg-amber-100 text-amber-800", icon: <Clock className="w-3.5 h-3.5" /> };
      case 2:
        return { text: "Đang đóng gói", color: "bg-blue-100 text-blue-800", icon: <Package className="w-3.5 h-3.5" /> };
      case 3:
        return { text: "Đang giao hàng", color: "bg-purple-100 text-purple-800", icon: <Truck className="w-3.5 h-3.5" /> };
      case 4:
        return { text: "Đã giao thành công", color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case 5:
        return { text: "Đã hủy", color: "bg-red-100 text-red-800", icon: <XCircle className="w-3.5 h-3.5" /> };
      default:
        return { text: "Đang xử lý", color: "bg-gray-100 text-gray-800", icon: <AlertCircle className="w-3.5 h-3.5" /> };
    }
  };

  const statusInfo = layTrangThai(order.status);

  // Xử lý hủy đơn
  const handleHuyDon = async () => {
    if (!confirm(`Bạn có chắc muốn hủy đơn hàng #DH${order.id}?`)) return;

    try {
      setDangHuy(true);
      await axios.patch(`${API_CONFIG.BASE_URL}/orders/${order.id}/cancel`, {
        cancel_reason: "Khách hủy đơn từ trang cá nhân",
      });
      alert("Hủy đơn hàng thành công!");
      if (onCancelSuccess) onCancelSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể hủy đơn hàng này.");
    } finally {
      setDangHuy(false);
    }
  };

  const details = order.details || [];
  const tamTinh = details.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#B83A63] to-[#9E2F54] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h3 className="font-bold text-base sm:text-lg">
              Chi tiết đơn hàng #DH{order.id}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung Modal (Cuộn được) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* 1. Trạng thái xử lý */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Trạng thái đơn hàng:
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                {statusInfo.icon}
                <span>{statusInfo.text}</span>
              </span>
            </div>

            {/* Quy trình tiến độ */}
            {Number(order.status) !== 5 ? (
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold text-gray-600 pt-1">
                <div className={`p-1.5 rounded-lg ${Number(order.status) >= 1 ? "bg-pink-100 text-[#B83A63] font-bold" : "bg-gray-200"}`}>
                  1. Chờ xác nhận
                </div>
                <div className={`p-1.5 rounded-lg ${Number(order.status) >= 2 ? "bg-pink-100 text-[#B83A63] font-bold" : "bg-gray-200"}`}>
                  2. Đang đóng gói
                </div>
                <div className={`p-1.5 rounded-lg ${Number(order.status) >= 3 ? "bg-pink-100 text-[#B83A63] font-bold" : "bg-gray-200"}`}>
                  3. Đang giao hàng
                </div>
                <div className={`p-1.5 rounded-lg ${Number(order.status) >= 4 ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-gray-200"}`}>
                  4. Hoàn thành
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Lý do hủy: {order.cancel_reason || "Khách hàng đã hủy đơn"}</span>
              </div>
            )}
          </div>

          {/* 2. Danh sách sản phẩm trong đơn */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-800 uppercase text-xs tracking-wider">
              Sản phẩm trong đơn ({details.length} món)
            </h4>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden bg-white">
              {details.map((item, idx) => (
                <div key={idx} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={layLinkAnh(item.product?.image)}
                      alt={item.product?.name || "Hoa tươi"}
                      onError={(e) => { e.currentTarget.src = "/images/hoa.jpg"; }}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-1">
                        {item.product?.name || "Hoa tươi"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Số lượng: <strong className="text-gray-800">{item.qty}</strong> x {dinhDangTien(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 text-xs sm:text-sm shrink-0">
                    {dinhDangTien(Number(item.price || 0) * Number(item.qty || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Bảng tính tiền chi tiết */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính hàng:</span>
              <span className="font-semibold text-gray-800">{dinhDangTien(tamTinh)}</span>
            </div>

            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Mã giảm giá ({order.coupon_code || "Voucher"}):</span>
                <span>- {dinhDangTien(order.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Phí giao hàng:</span>
              <span className="font-semibold text-gray-800">
                {Number(order.shipping_fee) > 0 ? dinhDangTien(order.shipping_fee) : "Miễn phí (0 đ)"}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm">
              <span className="font-bold text-gray-800">Tổng thanh toán:</span>
              <span className="text-base sm:text-lg font-extrabold text-[#B83A63]">
                {dinhDangTien(order.total)}
              </span>
            </div>
          </div>

          {/* 4. Thông tin người nhận hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <p className="font-bold text-gray-700 uppercase text-[11px]">Người nhận hàng:</p>
              <p className="font-semibold text-gray-800">{order.name}</p>
              <p className="text-gray-500">SĐT: {order.phone}</p>
              <p className="text-gray-700 mt-1">Địa chỉ: {order.address}</p>
              {order.note && <p className="text-gray-500 italic mt-1">Ghi chú: {order.note}</p>}
            </div>

            <div className="p-3.5 bg-pink-50/50 rounded-xl border border-pink-100 flex flex-col justify-between gap-2 text-xs">
              <div>
                <p className="font-bold text-gray-700 uppercase text-[11px]">Hình thức thanh toán:</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {order.payment_method === "qr"
                    ? "Chuyển khoản VietQR (Tự động SePay)"
                    : "Thanh toán khi nhận hàng (COD)"}
                </p>
              </div>

              <div>
                {Number(order.payment_status) === 1 ? (
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    ✓ Đã thanh toán
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    ⏳ Chưa thanh toán
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Modal: Nút Hủy đơn (CHỈ HIỆN KHI ĐƠN ĐANG CHỜ XÁC NHẬN - status === 1) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          {Number(order.status) === 1 ? (
            <button
              type="button"
              disabled={dangHuy}
              onClick={handleHuyDon}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl border border-red-200 transition cursor-pointer disabled:opacity-50"
            >
              {dangHuy ? "Đang hủy đơn..." : "Hủy đơn hàng này"}
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Đóng lại
          </button>
        </div>

      </div>
    </div>
  );
}
