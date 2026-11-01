import axiosAdmin from "@/lib/axiosAdmin";

// 1. Lấy danh sách khuyến mãi cho admin (có lọc, phân trang)
export async function getSales(params = {}) {
  const res = await axiosAdmin.get("/admin/productsales", { params });
  return res;
}

// 2. Lấy thông tin chi tiết một khuyến mãi theo ID
export async function getSaleById(id) {
  const res = await axiosAdmin.get(`/admin/productsales/${id}`);
  return res.data || res;
}

// 3. Thêm mới khuyến mãi / mã giảm giá
export async function createSale(data) {
  const res = await axiosAdmin.post("/admin/productsales", data);
  return res.data || res;
}

// 4. Cập nhật khuyến mãi
export async function updateSale(id, data) {
  const res = await axiosAdmin.put(`/admin/productsales/${id}`, data);
  return res.data || res;
}

// 5. Xóa tạm khuyến mãi (chuyển vào thùng rác)
export async function deleteSale(id) {
  return await axiosAdmin.delete(`/admin/productsales/${id}`);
}

// 6. Lấy danh sách khuyến mãi trong thùng rác
export async function getTrashSales(params = {}) {
  return await axiosAdmin.get("/admin/productsales/trash", { params });
}

// 7. Khôi phục khuyến mãi từ thùng rác
export async function restoreSale(id) {
  return await axiosAdmin.patch(`/admin/productsales/${id}/restore`);
}

// 8. Xóa vĩnh viễn khuyến mãi khỏi database
export async function forceDeleteSale(id) {
  return await axiosAdmin.delete(`/admin/productsales/${id}/force`);
}
