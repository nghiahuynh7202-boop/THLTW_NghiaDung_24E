"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import API_CONFIG from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import OrderDetailModal from "@/components/profile/OrderDetailModal";
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
  Eye,
  Edit3,
  Save,
  X,
  XCircle
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
 * Trang cá nhân người dùng (Profile)
 * - Tab 1: Thông tin tài khoản (có nút Sửa và Lưu trực tiếp vào CSDL SQL)
 * - Tab 2: Lịch sử đơn hàng (bấm Xem chi tiết sẽ mở popup riêng)
 */
export default function TrangProfile() {
  const router = useRouter();
  const { user, logout, loading, updateUser } = useAuth();

  // 2 tab chính: "profile" (thông tin) hoặc "orders" (đơn hàng)
  const [tabHienTai, setTabHienTai] = useState("profile");

  // Dữ liệu đơn hàng
  const [danhSachDon, setDanhSachDon] = useState([]);
  const [dangTaiDon, setDangTaiDon] = useState(false);

  // Đơn hàng đang mở xem chi tiết
  const [donDangXem, setDonDangXem] = useState(null);

  // Trạng thái sửa thông tin tài khoản
  const [dangSuaThongTin, setDangSuaThongTin] = useState(false);
  const [dangLuuThongTin, setDangLuuThongTin] = useState(false);
  const [formSua, setFormSua] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Đồng bộ thông tin user vào form sửa khi có user
  useEffect(() => {
    if (user) {
      setFormSua({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // 1. Gọi API lấy danh sách đơn hàng
  const layDanhSachDon = (userId) => {
    if (!userId) return;
    setDangTaiDon(true);
    axios
      .get(`${API_CONFIG.BASE_URL}/orders?user_id=${userId}`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setDanhSachDon(Array.isArray(data) ? data : []);
      })
      .catch(() => setDanhSachDon([]))
      .finally(() => setDangTaiDon(false));
  };

  useEffect(() => {
    if (user?.id) {
      layDanhSachDon(user.id);
    }
  }, [user?.id]);

  // 2. Hàm lưu cập nhật thông tin vào CSDL SQL qua API PUT /api/profile
  const xuLyLuuThongTin = async (e) => {
    e.preventDefault();
    if (!formSua.name.trim()) {
      alert("Họ và tên không được để trống!");
      return;
    }

    try {
      setDangLuuThongTin(true);
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.put(
        `${API_CONFIG.BASE_URL}/profile`,
        {
          user_id: user.id,
          name: formSua.name.trim(),
          phone: formSua.phone?.trim() || null,
          address: formSua.address?.trim() || null,
        },
        { headers }
      );

      const updatedUser = res.data?.user || {
        ...user,
        name: formSua.name.trim(),
        phone: formSua.phone?.trim() || null,
        address: formSua.address?.trim() || null,
      };

      // Cập nhật lại Auth state & LocalStorage
      if (updateUser) {
        updateUser(updatedUser);
      } else {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      alert("Cập nhật thông tin thành công và đã lưu vào CSDL!");
      setDangSuaThongTin(false);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi lưu thông tin vào CSDL.");
    } finally {
      setDangLuuThongTin(false);
    }
  };

  // Hủy chế độ sửa thông tin
  const xuLyHuySua = () => {
    setFormSua({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setDangSuaThongTin(false);
  };

  // 3. Hàm xử lý hủy đơn hàng (chỉ cho phép khi Chờ xác nhận - status === 1)
  const xuLyHuyDon = async (orderId) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #DH${orderId} không?`)) {
      return;
    }

    try {
      await axios.patch(`${API_CONFIG.BASE_URL}/orders/${orderId}/cancel`, {
        cancel_reason: "Khách hàng tự hủy trên trang cá nhân",
      });

      alert("Hủy đơn hàng thành công!");
      layDanhSachDon(user?.id);
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể hủy đơn hàng này.";
      alert(msg);
    }
  };

  // Định dạng tiền VNĐ
  const dinhDangTien = (tien) => Number(tien || 0).toLocaleString("vi-VN") + " đ";

  // Đăng xuất
  const xuLyDangXuat = () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      logout();
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500 font-sans text-xs">
        Đang tải thông tin...
      </div>
    );
  }

  // Khách chưa đăng nhập
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xs border text-center max-w-md w-full">
          <User className="w-12 h-12 text-[#B83A63] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Chưa đăng nhập</h2>
          <p className="text-gray-500 text-xs mb-5">Vui lòng đăng nhập để theo dõi đơn hàng của bạn.</p>
          <Link
            href="/login"
            className="inline-block w-full py-2.5 px-4 bg-[#B83A63] hover:bg-[#9E2F54] text-white font-semibold text-xs rounded-xl"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER USER */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#B83A63] to-[#9E2F54] p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-white text-[#B83A63] font-bold text-2xl flex items-center justify-center shadow">
                {user.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="text-xl font-bold">{user.name}</h1>
                <p className="text-xs text-white/90">{user.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-semibold bg-white/20 rounded-full">
                  {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                </span>
              </div>
            </div>

            <button
              onClick={xuLyDangXuat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>

          {/* 2 TAB: THÔNG TIN TÀI KHOẢN & ĐƠN HÀNG */}
          <div className="flex border-b border-gray-200 bg-white text-xs">
            <button
              type="button"
              onClick={() => setTabHienTai("profile")}
              className={`flex-1 py-3.5 px-3 font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                tabHienTai === "profile"
                  ? "border-[#B83A63] text-[#B83A63] bg-pink-50/40"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Thông tin tài khoản</span>
            </button>

            <button
              type="button"
              onClick={() => setTabHienTai("orders")}
              className={`flex-1 py-3.5 px-3 font-bold transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                tabHienTai === "orders"
                  ? "border-[#B83A63] text-[#B83A63] bg-pink-50/40"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Đơn hàng của tôi ({danhSachDon.length})</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: THÔNG TIN TÀI KHOẢN ================= */}
        {tabHienTai === "profile" && (
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
            {/* Tiêu đề & Nút Sửa thông tin */}
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Thông tin chi tiết
              </h2>

              {!dangSuaThongTin && (
                <button
                  type="button"
                  onClick={() => setDangSuaThongTin(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa thông tin</span>
                </button>
              )}
            </div>

            {/* KHI Ở CHẾ ĐỘ XEM THÔNG TIN */}
            {!dangSuaThongTin ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Họ và tên</p>
                      <p className="font-semibold text-gray-800">{user.name || "---"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p className="font-semibold text-gray-800">{user.email || "---"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Số điện thoại</p>
                      <p className="font-semibold text-gray-800">{user.phone || "Chưa cập nhật"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400">Địa chỉ giao hàng</p>
                      <p className="font-semibold text-gray-800">{user.address || "Chưa cập nhật"}</p>
                    </div>
                  </div>

                  {user.created_at && (
                    <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl sm:col-span-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-gray-400">Ngày tham gia</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(user.created_at).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Tiếp tục mua hàng</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* KHI Ở CHẾ ĐỘ SỬA THÔNG TIN (LƯU VÀO SQL) */
              <form onSubmit={xuLyLuuThongTin} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={formSua.name}
                      onChange={(e) => setFormSua({ ...formSua, name: e.target.value })}
                      placeholder="Nhập họ và tên..."
                      className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                    />
                  </div>

                  {/* Email (Cố định tài khoản) */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Email đăng nhập <span className="text-gray-400 font-normal">(Cố định)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email || ""}
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={formSua.phone}
                      onChange={(e) => setFormSua({ ...formSua, phone: e.target.value })}
                      placeholder="0901234567..."
                      className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                    />
                  </div>

                  {/* Địa chỉ giao hàng */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Địa chỉ giao hàng mặc định</label>
                    <input
                      type="text"
                      value={formSua.address}
                      onChange={(e) => setFormSua({ ...formSua, address: e.target.value })}
                      placeholder="Số nhà, tên đường, quận/huyện..."
                      className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#B83A63] focus:ring-1 focus:ring-[#B83A63]"
                    />
                  </div>
                </div>

                {/* Nút Lưu & Hủy */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={dangLuuThongTin}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B83A63] hover:bg-[#9E2F54] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{dangLuuThongTin ? "Đang lưu vào SQL..." : "Lưu thay đổi"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={xuLyHuySua}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hủy bỏ</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 2: DANH SÁCH ĐƠN HÀNG ================= */}
        {tabHienTai === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Lịch sử đơn hàng ({danhSachDon.length})
              </h2>
              <button
                type="button"
                onClick={() => layDanhSachDon(user.id)}
                className="text-xs text-[#B83A63] hover:text-[#9E2F54] inline-flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dangTaiDon ? "animate-spin" : ""}`} />
                <span>Làm mới</span>
              </button>
            </div>

            {dangTaiDon ? (
              <div className="bg-white p-12 text-center text-xs text-gray-400 rounded-2xl border">
                Đang tải đơn hàng...
              </div>
            ) : danhSachDon.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border shadow-xs">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-700 mb-1">Chưa có đơn hàng nào</h3>
                <Link
                  href="/"
                  className="mt-3 inline-block py-2 px-5 bg-[#B83A63] hover:bg-[#9E2F54] text-white text-xs font-bold rounded-xl"
                >
                  Mua hoa ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {danhSachDon.map((order) => {
                  const details = order.details || [];
                  const isPaid = Number(order.payment_status) === 1;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden hover:border-pink-300 transition"
                    >
                      {/* Tiêu đề đơn */}
                      <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-gray-900 font-mono">
                            #DH{order.id}
                          </span>
                          <span className="text-gray-400">
                            • {order.created_at ? new Date(order.created_at).toLocaleDateString("vi-VN") : "Hôm nay"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-[#B83A63]">
                            {order.status_label || "Đang xử lý"}
                          </span>
                          {isPaid ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              <span>Đã thanh toán</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                              <Banknote className="w-3 h-3 text-slate-500" />
                              <span>Chưa thanh toán</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Danh sách rút gọn các món */}
                      <div className="p-4 divide-y divide-gray-100">
                        {details.map((item, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={layLinkAnh(item.product?.image)}
                                alt={item.product?.name}
                                onError={(e) => { e.currentTarget.src = "/images/hoa.jpg"; }}
                                className="w-12 h-12 object-cover rounded-lg border shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-gray-800 line-clamp-1">{item.product?.name || "Hoa tươi"}</p>
                                <p className="text-gray-500">SL: {item.qty} x {dinhDangTien(item.price)}</p>
                              </div>
                            </div>
                            <span className="font-bold text-gray-800 shrink-0">
                              {dinhDangTien(Number(item.price || 0) * Number(item.qty || 1))}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer: Tổng tiền + Nút Hủy đơn (khi Chờ xác nhận) + Nút Xem chi tiết */}
                      <div className="p-4 bg-gray-50/40 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-gray-500">Tổng tiền: </span>
                          <span className="font-extrabold text-sm sm:text-base text-[#B83A63]">
                            {dinhDangTien(order.total)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* NÚT HỦY ĐƠN: CHỈ HIỆN KHI ĐƠN Ở TRẠNG THÁI "CHỜ XÁC NHẬN" (status === 1) */}
                          {Number(order.status) === 1 && (
                            <button
                              type="button"
                              onClick={() => xuLyHuyDon(order.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-xs rounded-xl transition cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Hủy đơn</span>
                            </button>
                          )}

                          {/* NÚT BẬT POPUP XEM CHI TIẾT */}
                          <button
                            type="button"
                            onClick={() => setDonDangXem(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B83A63] hover:bg-[#9E2F54] text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem chi tiết</span>
                          </button>
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

      {/* POPUP CHI TIẾT ĐƠN HÀNG */}
      {donDangXem && (
        <OrderDetailModal
          order={donDangXem}
          onClose={() => setDonDangXem(null)}
          onCancelSuccess={() => {
            layDanhSachDon(user.id);
            setDonDangXem(null);
          }}
        />
      )}

    </div>
  );
}
