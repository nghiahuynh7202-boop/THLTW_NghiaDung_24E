import axiosAdmin from "@/lib/axiosAdmin";

const ADMIN_ORDERS = "/admin/orders";

export async function getAdminOrders(params = {}) {
  const res = await axiosAdmin.get(ADMIN_ORDERS, { params });
  return {
    data: res.data || res || [],
    meta: res.meta || null,
  };
}

export async function getAdminOrderById(id) {
  const res = await axiosAdmin.get(`${ADMIN_ORDERS}/${id}`);
  return res.data || res;
}

export async function updateOrder(id, data) {
  const res = await axiosAdmin.put(`${ADMIN_ORDERS}/${id}`, data);
  return {
    data: res.data || res,
    message: res.message || "Cập nhật đơn hàng thành công",
  };
}

export async function cancelOrder(id, cancelReason = "Admin hủy đơn hàng") {
  const res = await axiosAdmin.patch(`${ADMIN_ORDERS}/${id}/cancel`, {
    cancel_reason: cancelReason,
  });
  return {
    data: res.data || res,
    message: res.message || "Hủy đơn hàng thành công",
  };
}

export async function deleteOrder(id) {
  return await axiosAdmin.delete(`${ADMIN_ORDERS}/${id}`);
}
