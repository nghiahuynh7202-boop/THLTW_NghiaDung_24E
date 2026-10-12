"use client";

import { useEffect, useState } from "react";
import { getUsers, toggleUserStatus, getUserOrders } from "@/services/userServices";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  // Popup 1: Xem chi tiết thông tin khách hàng
  const [detailUser, setDetailUser] = useState(null);

  // Popup 2: Xem chi tiết đơn hàng của khách hàng
  const [orderUser, setOrderUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // 1. Tải danh sách khách hàng
  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 2. Chặn hoặc Mở chặn tài khoản
  const handleToggleBlock = async (user) => {
    const isBlock = Number(user.status) === 1;
    if (!window.confirm(isBlock ? `Chặn "${user.name}"?` : `Mở chặn "${user.name}"?`)) return;

    await toggleUserStatus(user.id);
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: isBlock ? 0 : 1 } : u)));
    alert(isBlock ? "Đã chặn người dùng!" : "Đã mở chặn người dùng!");
  };

  // 3. Xem danh sách & chi tiết đơn hàng của khách hàng
  const handleViewOrders = async (user) => {
    setOrderUser(user);
    setLoadingOrders(true);
    const data = await getUserOrders(user.id);
    setOrders(data);
    setLoadingOrders(false);
  };

  return (
    <div className="space-y-4">
      {/* Tiêu đề trang */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Quản lý khách hàng</h1>
          <p className="text-xs text-gray-500">Xem danh sách, thông tin chi tiết và lịch sử mua hàng</p>
        </div>
        <button
          onClick={loadUsers}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
        >
          Làm mới
        </button>
      </div>

      {/* Bảng danh sách khách hàng */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 font-semibold uppercase text-[11px]">
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Họ và tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Số điện thoại</th>
              <th className="p-3 text-center">Trạng thái</th>
              <th className="p-3 text-center min-w-[210px] whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user, index) => {
              const isActive = Number(user.status) === 1;

              return (
                <tr key={user.id} className="hover:bg-gray-50/80">
                  <td className="p-3 text-center text-gray-400">{index + 1}</td>
                  <td className="p-3 font-bold text-gray-800">{user.name || "Chưa đặt tên"}</td>
                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3 text-gray-600">{user.phone || "—"}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isActive ? "● Hoạt động" : "● Đã chặn"}
                    </span>
                  </td>

                  {/* Cột THAO TÁC xếp ngang thẳng hàng đẹp mắt */}
                  <td className="p-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* 1. Nút Chi tiết */}
                      <button
                        onClick={() => setDetailUser(user)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition"
                      >
                        Chi tiết
                      </button>

                      {/* 2. Nút Đơn hàng */}
                      <button
                        onClick={() => handleViewOrders(user)}
                        className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition"
                      >
                        Đơn hàng
                      </button>

                      {/* 3. Nút Chặn / Mở chặn */}
                      <button
                        onClick={() => handleToggleBlock(user)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer border transition ${
                          isActive
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                        }`}
                      >
                        {isActive ? "Chặn" : "Mở chặn"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* POPUP 1: XEM CHI TIẾT THÔNG TIN KHÁCH HÀNG               */}
      {/* ========================================================= */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-xs">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-800 text-sm">Chi tiết khách hàng: {detailUser.name}</h3>
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
              <div><span className="text-gray-400">Vai trò:</span> <span className="text-blue-600 font-semibold">{detailUser.role}</span></div>
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
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* POPUP 2: XEM CHI TIẾT ĐƠN HÀNG CỦA KHÁCH HÀNG            */}
      {/* ========================================================= */}
      {orderUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-xs">
            {/* Header Popup */}
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-gray-800 text-sm">
                Đơn hàng của khách hàng: {orderUser.name}
              </h3>
              <button onClick={() => setOrderUser(null)} className="text-gray-400 hover:text-black font-bold text-base cursor-pointer">
                ✕
              </button>
            </div>

            {/* Danh sách đơn hàng */}
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
                    {/* Hàng 1: Mã đơn, ngày, trạng thái, tổng tiền */}
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div>
                        <strong className="text-gray-800">Đơn hàng #{o.id}</strong>
                        <span className="text-[11px] text-gray-400 ml-2">{o.created_at || ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          {o.status_label || "Đang xử lý"}
                        </span>
                        <strong className="text-rose-600 text-xs">{Number(o.total || 0).toLocaleString()} đ</strong>
                      </div>
                    </div>

                    {/* Hàng 2: Thông tin giao hàng */}
                    <div className="text-[11px] text-gray-600 space-y-0.5">
                      <div>Người nhận: <strong>{o.name || orderUser.name}</strong> - SĐT: <strong>{o.phone || orderUser.phone || "—"}</strong></div>
                      {o.address && <div>Địa chỉ giao: <span>{o.address}</span></div>}
                      <div>Hình thức thanh toán: <span className="uppercase font-semibold">{o.payment_method || "COD"}</span></div>
                    </div>

                    {/* Hàng 3: Danh sách sản phẩm/hoa đã mua trong đơn */}
                    {o.details && o.details.length > 0 && (
                      <div className="pt-2 border-t space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Sản phẩm đã mua:</span>
                        {o.details.map((item, i) => (
                          <div key={i} className="flex justify-between bg-gray-50 p-1.5 rounded text-[11px]">
                            <span>
                              {item.product?.name || `Hoa #${item.product_id}`} <span className="text-gray-400">x {item.quantity || 1}</span>
                            </span>
                            <span className="font-semibold text-gray-700">{Number(item.price || 0).toLocaleString()} đ</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Popup */}
            <div className="p-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setOrderUser(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg font-medium cursor-pointer"
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
