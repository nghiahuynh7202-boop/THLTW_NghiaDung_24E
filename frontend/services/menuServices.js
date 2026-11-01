import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";

const ADMIN = "/admin/menus";

// Lấy danh sách menu công khai cho frontend
export async function getPublicMenus(params = { per_page: 50 }) {
  try {
    const res = await axiosClient.get("/menus", { params });
    const list = res?.data || res || [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("Lỗi lấy danh sách menu:", err);
    return [];
  }
}

// 1. Lấy danh sách menu quản trị (Admin)
export async function getMenus(params = {}) {
  const res = await axiosAdmin.get(ADMIN, { params });
  const list = res?.data?.data || res?.data || res || [];
  return Array.isArray(list) ? list : [];
}

// 2. Lấy chi tiết 1 menu
export async function getMenuById(id) {
  const res = await axiosAdmin.get(`${ADMIN}/${id}`);
  return res?.data?.data || res?.data || res;
}

// 3. Thêm mới menu
export async function createMenu(data) {
  const res = await axiosAdmin.post(ADMIN, data);
  return res;
}

// 4. Cập nhật menu
export async function updateMenu(id, data) {
  const res = await axiosAdmin.put(`${ADMIN}/${id}`, data);
  return res;
}

// 5. Xóa tạm menu (chuyển vào thùng rác)
export async function deleteMenu(id) {
  const res = await axiosAdmin.delete(`${ADMIN}/${id}`);
  return res;
}

// 6. Lấy danh sách menu trong thùng rác
export async function getTrashMenus(params = {}) {
  const res = await axiosAdmin.get(`${ADMIN}/trash`, { params });
  const list = res?.data?.data || res?.data || res || [];
  return Array.isArray(list) ? list : [];
}

// 7. Khôi phục menu từ thùng rác
export async function restoreMenu(id) {
  const res = await axiosAdmin.patch(`${ADMIN}/${id}/restore`);
  return res;
}

// 8. Xóa vĩnh viễn menu
export async function forceDeleteMenu(id) {
  const res = await axiosAdmin.delete(`${ADMIN}/${id}/force`);
  return res;
}
