import axiosAdmin from "@/lib/axiosAdmin";

// 1. Lấy danh sách người dùng (khách hàng)
export async function getUsers(params = {}) {
  const res = await axiosAdmin.get("/admin/users", { params });
  const list = res?.data?.data || res?.data || res || [];
  return Array.isArray(list) ? list : [];
}

// 2. Lấy chi tiết một người dùng theo ID
export async function getUserById(id) {
  const res = await axiosAdmin.get(`/admin/users/${id}`);
  return res?.data?.data || res?.data || res;
}

// 3. Chặn hoặc Mở chặn tài khoản người dùng
export async function toggleUserStatus(id) {
  const res = await axiosAdmin.patch(`/admin/users/${id}/toggle-status`);
  return res;
}

// 4. Lấy danh sách đơn hàng của người dùng
export async function getUserOrders(id) {
  const res = await axiosAdmin.get(`/admin/users/${id}/orders`);
  const list = res?.data?.data || res?.data || res || [];
  return Array.isArray(list) ? list : [];
}
