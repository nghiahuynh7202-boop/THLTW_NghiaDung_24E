import axiosAdmin from "@/lib/axiosAdmin";

// 1. Lấy danh sách trang đơn (trang tĩnh)
export async function getPages(params = {}) {
  const res = await axiosAdmin.get("/admin/pages", { params });
  return res;
}

// 2. Lấy chi tiết trang đơn theo ID
export async function getPageById(id) {
  const res = await axiosAdmin.get(`/admin/pages/${id}`);
  return res.data || res;
}

// 3. Thêm mới trang đơn
export async function createPage(data) {
  const res = await axiosAdmin.post("/admin/pages", data);
  return res.data || res;
}

// 4. Cập nhật trang đơn
export async function updatePage(id, data) {
  const res = await axiosAdmin.put(`/admin/pages/${id}`, data);
  return res.data || res;
}

// 5. Xóa trang đơn (vào thùng rác)
export async function deletePage(id) {
  return await axiosAdmin.delete(`/admin/pages/${id}`);
}

// 6. Lấy danh sách trang đơn trong thùng rác
export async function getTrashPages(params = {}) {
  const res = await axiosAdmin.get("/admin/pages/trash", { params });
  return res;
}

// 7. Khôi phục trang đơn từ thùng rác
export async function restorePage(id) {
  return await axiosAdmin.patch(`/admin/pages/${id}/restore`);
}

// 8. Xóa vĩnh viễn trang đơn khỏi database
export async function forceDeletePage(id) {
  return await axiosAdmin.delete(`/admin/pages/${id}/force`);
}
