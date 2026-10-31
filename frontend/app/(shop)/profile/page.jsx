"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  ArrowLeft,
  Package,
  ShoppingBag,
  CreditCard,
  Banknote,
  RefreshCw,
} from "lucide-react";

// Xử lý link ảnh
const resolveImgUrl = (rawImg) => {
  const raw = rawImg ? String(rawImg).trim() : "";
  if (!raw) return "/images/hoa.jpg";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:") || raw.startsWith("/images/")) {
    return raw;
  }
  const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
  const clean = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `http://${hostname}:8000/storage/${clean}`;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab: "profile" (thông tin cá nhân) hoặc "orders" (đơn hàng của tôi)
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Lấy thông tin user từ localStorage khi tải trang
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách đơn hàng của user từ API
  const fetchMyOrders = useCallback(async (userId) => {
    if (!userId) return;
    setLoadingOrders(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/orders?user_id=${userId}`);
      const list = res.data?.data || res.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchMyOrders(user.id);
    }
  }, [user?.id, fetchMyOrders]);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    alert("Đăng xuất thành công!");
    router.push("/login");
  };

  const formatMoney = (money) => {
    return Number(money || 0).toLocaleString("vi-VN") + " đ";
  };

  // Màu trạng thái đơn hàng
  const getStatusBadge = (status, label) => {
    switch (Number(status)) {
      case 1:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Chờ xác nhận</span>;
      case 2:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Đang xử lý</span>;
      case 3:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">Đang giao hàng</span>;
      case 4:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Đã giao thành công</span>;
      case 5:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">{label || "Đang xử lý"}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500 font-sans">
        Đang tải thông tin...
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 text-[#f68b1f] rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa đăng nhập</h2>
          <p className="text-gray-500 text-sm mb-6">
            Vui lòng đăng nhập để xem thông tin tài khoản và danh sách đơn hàng của bạn.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-2.5 px-4 bg-[#f68b1f] hover:bg-[#e67300] text-white font-medium rounded-lg transition"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  // ĐÃ ĐĂNG NHẬP
  return (
    <div className="min-h-[75vh] bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Banner đầu trang hồ sơ */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-[#f68b1f] p-6 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white text-[#f68b1f] font-bold text-2xl flex items-center justify-center shadow">
                {user.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.name}</h1>
                <p className="text-xs text-white/90">{user.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-semibold bg-white/20 rounded-full backdrop-blur-xs">
                  {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>

          {/* THANH TAB ĐIỀU HƯỚNG */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                activeTab === "profile"
                  ? "border-[#f68b1f] text-[#f68b1f] bg-orange-50/30"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Thông tin tài khoản</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                activeTab === "orders"
                  ? "border-[#f68b1f] text-[#f68b1f] bg-orange-50/30"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Đơn hàng của tôi ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: THÔNG TIN TÀI KHOẢN                                                */}
        {/* ========================================================================= */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-gray-800 uppercase border-b pb-2">
              Chi tiết thông tin
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Họ và tên</p>
                  <p className="text-sm font-semibold text-gray-800">{user.name || "---"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-semibold text-gray-800">{user.email || "---"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Số điện thoại</p>
                  <p className="text-sm font-semibold text-gray-800">{user.phone || "Chưa cập nhật"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Địa chỉ giao hàng mặc định</p>
                  <p className="text-sm font-semibold text-gray-800">{user.address || "Chưa cập nhật"}</p>
                </div>
              </div>

              {user.created_at && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Ngày tham gia</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(user.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Về trang chủ</span>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ĐƠN HÀNG CỦA TÔI                                                   */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase">
                Lịch sử đơn hàng ({orders.length})
              </h2>
              <button
                type="button"
                onClick={() => fetchMyOrders(user.id)}
                className="text-xs text-[#f68b1f] hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                <span>Làm mới</span>
              </button>
            </div>

            {loadingOrders ? (
              <div className="bg-white p-12 text-center text-xs text-gray-400 rounded-2xl border">
                Đang tải danh sách đơn hàng...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-xs">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-700 mb-1">
                  Bạn chưa có đơn hàng nào
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Hãy chọn cho mình và người thân những bó hoa tươi đẹp nhất nhé!
                </p>
                <Link
                  href="/"
                  className="inline-block py-2 px-5 bg-[#f68b1f] text-white text-xs font-bold rounded-lg"
                >
                  Khám phá hoa tươi ngay
                </Link>
              </div>
            ) : (
              /* Danh sách các đơn hàng */
              <div className="space-y-4">
                {orders.map((order) => {
                  const details = order.details || [];
                  const isPaid = Number(order.payment_status) === 1;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden"
                    >
                      {/* Tiêu đề đơn hàng: Mã đơn + Ngày đặt + Trạng thái */}
                      <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-gray-900 font-mono">
                            #DH{order.id}
                          </span>
                          <span className="text-xs text-gray-400">
                            • {order.created_at ? new Date(order.created_at).toLocaleDateString("vi-VN") : "Hôm nay"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Trạng thái đơn hàng */}
                          {getStatusBadge(order.status, order.status_label)}

                          {/* Trạng thái thanh toán */}
                          {isPaid ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              <span>Đã thanh toán (SePay)</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                              <Banknote className="w-3 h-3 text-slate-500" />
                              <span>Chưa thanh toán ({order.payment_method === "qr" ? "Chờ CK SePay" : "Tiền mặt COD"})</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Danh sách sản phẩm trong đơn */}
                      <div className="p-4 divide-y divide-gray-100">
                        {details.map((item, idx) => (
                          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                <img
                                  src={resolveImgUrl(item.product?.image)}
                                  alt={item.product?.name || "Hoa tươi"}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = "/images/hoa.jpg";
                                  }}
                                />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                                  {item.product?.name || "Sản phẩm hoa tươi"}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Số lượng: <strong className="text-gray-800">{item.qty}</strong> x {formatMoney(item.price)}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 shrink-0">
                              {formatMoney(Number(item.price || 0) * Number(item.qty || 1))}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Chân đơn hàng: Người nhận, Địa chỉ, Tổng tiền */}
                      <div className="p-4 bg-gray-50/40 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-gray-500 space-y-0.5">
                          <p>
                            Giao tới: <strong className="text-gray-800">{order.name}</strong> ({order.phone})
                          </p>
                          <p className="line-clamp-1 text-gray-500">
                            Địa chỉ: {order.address}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-gray-500">Tổng thanh toán: </span>
                          <span className="text-base font-extrabold text-[#d32f2f]">
                            {formatMoney(order.total)}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
