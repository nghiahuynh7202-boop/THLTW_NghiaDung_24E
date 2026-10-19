import axiosAdmin from "@/lib/axiosAdmin";

const ADMIN_ORDERS = "/admin/orders";

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.orders)) return res.orders;
  return [];
}

function extractItem(res) {
  return res?.data?.data ?? res?.data ?? res ?? null;
}

export async function getAdminOrders(params = {}) {
  const res = await axiosAdmin.get(ADMIN_ORDERS, { params });
  return {
    data: extractList(res),
    meta: res?.meta ?? res?.pagination ?? null,
  };
}

export async function getAdminOrderById(id) {
  const res = await axiosAdmin.get(`${ADMIN_ORDERS}/${id}`);
  return extractItem(res);
}

export async function updateOrder(id, data) {
  const res = await axiosAdmin.put(`${ADMIN_ORDERS}/${id}`, data);
  return {
    data: extractItem(res),
    message: res?.message ?? "Cập nhật đơn hàng thành công",
  };
}

export async function cancelOrder(id, cancelReason = "Admin hủy đơn hàng") {
  const res = await axiosAdmin.patch(`${ADMIN_ORDERS}/${id}/cancel`, {
    cancel_reason: cancelReason,
  });
  return {
    data: extractItem(res),
    message: res?.message ?? "Hủy đơn hàng thành công",
  };
}

export async function deleteOrder(id) {
  const res = await axiosAdmin.delete(`${ADMIN_ORDERS}/${id}`);
  return {
    message: res?.message ?? "Xóa đơn hàng thành công",
  };
}
