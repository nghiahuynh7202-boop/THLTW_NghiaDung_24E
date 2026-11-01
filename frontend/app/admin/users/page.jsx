"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getUsers, toggleUserStatus, getUserOrders } from "@/services/userServices";
import { Users, Search, RefreshCw } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Popup 1: Xem chi tiết thông tin khách hàng
  const [detailUser, setDetailUser] = useState(null);

  // Popup 2: Xem chi tiết đơn hàng của khách hàng
  const [orderUser, setOrderUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // 1. Tải danh sách khách hàng
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách user:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 2. Lọc khách hàng
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "all" && String(u.status) !== String(statusFilter)) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(term);
        const matchEmail = u.email?.toLowerCase().includes(term);
        const matchPhone = u.phone?.toLowerCase().includes(term);
        return matchName || matchEmail || matchPhone;
      }
      return true;
    });
  }, [users, statusFilter, searchTerm]);

  // 3. Phân trang
  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // 4. Khóa hoặc Mở khóa tài khoản người dùng
  const handleToggleBlock = async (user) => {
    // Không cho phép khóa tài khoản Admin
    if (user.role === "admin") {
      alert("⚠️ Không được phép khóa tài khoản Quản trị viên (Admin)!");
      return;
    }

    const isLocking = Number(user.status) === 1;
    if (
      !window.confirm(
        isLocking
          ? `Bạn có chắc muốn khóa tài khoản "${user.name}"?`
          : `Bạn có chắc muốn mở khóa tài khoản "${user.name}"?`
      )
    )
      return;

    try {
      await toggleUserStatus(user.id);
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, status: isLocking ? 0 : 1 } : u
        )
      );
      alert(
        isLocking
          ? "✅ Đã khóa tài khoản thành công!"
          : "✅ Đã mở khóa tài khoản thành công!"
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi đổi trạng thái tài khoản!";
      alert("❌ " + msg);
    }
  };

  // 5. Xem danh sách & chi tiết đơn hàng của khách hàng
  const handleViewOrders = async (user) => {
    setOrderUser(user);
    setLoadingOrders(true);
    try {
      const data = await getUserOrders(user.id);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#f68b1f]" />
              <span>Quản lý Khách hàng</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Xem danh sách, thông tin tài khoản và lịch sử đơn hàng của khách
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadUsers}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#f68b1f]" : ""}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Khung Card chính */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Thanh tiêu đề con & Tìm kiếm */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách khách hàng</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {filteredUsers.length}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm theo tên, email, sđt..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] w-48 sm:w-56"
                />
              </div>

              {/* Lọc trạng thái */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1.5 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white text-gray-600"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Hoạt động</option>
                <option value="0">Đã khóa</option>
              </select>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16 text-center">STT</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center min-w-[210px]">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải danh sách khách hàng...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => {
                    const isActive = Number(user.status) === 1;

                    return (
                      <tr key={user.id} className="hover:bg-orange-50/20 transition-colors">
                        {/* STT */}
                        <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        {/* Họ tên */}
                        <td className="py-3.5 px-4 font-semibold text-gray-800 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{user.name || "Chưa đặt tên"}</span>
                            {user.role === "admin" && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                Admin
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-gray-600">
                          {user.email}
                        </td>

                        {/* SĐT */}
                        <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                          {user.phone || "—"}
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-4 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Đã khóa
                            </span>
                          )}
                        </td>

                        {/* Hành động */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {/* Chi tiết */}
                            <button
                              onClick={() => setDetailUser(user)}
                              className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition cursor-pointer"
                            >
                              Chi tiết
                            </button>

                            {/* Đơn hàng */}
                            <button
                              onClick={() => handleViewOrders(user)}
                              className="px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-md transition cursor-pointer"
                            >
                              Đơn hàng
                            </button>

                            {/* Khóa / Mở khóa (Admin không được khóa Admin) */}
                            {user.role === "admin" ? (
                              <button
                                disabled
                                title="Không thể khóa tài khoản Quản trị viên"
                                className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                              >
                                Khóa
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleBlock(user)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer border ${
                                  isActive
                                    ? "text-red-500 hover:bg-red-50 border-red-200"
                                    : "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                }`}
                              >
                                {isActive ? "Khóa" : "Mở khóa"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-medium text-gray-500">Chưa có khách hàng nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="bg-gray-50/50 border-t border-gray-100 px-5 py-3 flex justify-center items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md text-xs font-medium cursor-pointer transition ${
                    currentPage === i + 1
                      ? "bg-[#f68b1f] text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === pageCount}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {/* POPUP 1: XEM CHI TIẾT THÔNG TIN KHÁCH HÀNG */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-800 text-sm">Chi tiết: {detailUser.name}</h3>
              <button onClick={() => setDetailUser(null)} className="text-gray-400 hover:text-black font-bold text-base cursor-pointer">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-2.5 text-gray-700">
              <div><span className="text-gray-400">Mã ID:</span> <strong>#{detailUser.id}</strong></div>
              <div><span className="text-gray-400">Họ và tên:</span> <strong>{detailUser.name || "Chưa đặt tên"}</strong></div>
              <div><span className="text-gray-400">Email:</span> <strong>{detailUser.email}</strong></div>
              <div><span className="text-gray-400">Số điện thoại:</span> <strong>{detailUser.phone || "Chưa có"}</strong></div>
              <div><span className="text-gray-400">Địa chỉ:</span> <strong>{detailUser.address || "Chưa cập nhật"}</strong></div>
              <div><span className="text-gray-400">Vai trò:</span> <span className="text-[#f68b1f] font-semibold">{detailUser.role}</span></div>
              <div>
                <span className="text-gray-400">Trạng thái:</span>{" "}
                <span className={Number(detailUser.status) === 1 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                  {Number(detailUser.status) === 1 ? "Đang hoạt động" : "Đang bị chặn"}
                </span>
              </div>
              <div><span className="text-gray-400">Ngày tạo:</span> <span>{detailUser.created_at || "—"}</span></div>
            </div>
            <div className="p-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setDetailUser(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: XEM CHI TIẾT ĐƠN HÀNG CỦA KHÁCH HÀNG */}
      {orderUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-xs">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-800 text-sm">
                Đơn hàng của: {orderUser.name}
              </h3>
              <button onClick={() => setOrderUser(null)} className="text-gray-400 hover:text-black font-bold text-base cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {loadingOrders ? (
                <div className="py-8 text-center text-gray-400">Đang tải đơn hàng...</div>
              ) : orders.length === 0 ? (
                <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                  Khách hàng chưa có đơn hàng nào.
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-3.5 border border-gray-200 rounded-xl space-y-2 bg-white shadow-2xs">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div>
                        <strong className="text-gray-800">Đơn hàng #{o.id}</strong>
                        <span className="text-[11px] text-gray-400 ml-2">{o.created_at || ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-50 text-[#f68b1f] border border-orange-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          {o.status_label || "Đang xử lý"}
                        </span>
                        <strong className="text-rose-600 text-xs">{Number(o.total || 0).toLocaleString("vi-VN")} đ</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-600 space-y-0.5">
                      <div>Người nhận: <strong>{o.name || orderUser.name}</strong> - SĐT: <strong>{o.phone || orderUser.phone || "—"}</strong></div>
                      {o.address && <div>Địa chỉ: <span>{o.address}</span></div>}
                      <div>Hình thức: <span className="uppercase font-semibold">{o.payment_method || "COD"}</span></div>
                    </div>

                    {o.details && o.details.length > 0 && (
                      <div className="pt-2 border-t space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Sản phẩm:</span>
                        {o.details.map((item, i) => (
                          <div key={i} className="flex justify-between bg-gray-50 p-1.5 rounded text-[11px]">
                            <span>
                              {item.product?.name || `Hoa #${item.product_id}`} <span className="text-gray-400">x {item.quantity || 1}</span>
                            </span>
                            <span className="font-semibold text-gray-700">{Number(item.price || 0).toLocaleString("vi-VN")} đ</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setOrderUser(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
