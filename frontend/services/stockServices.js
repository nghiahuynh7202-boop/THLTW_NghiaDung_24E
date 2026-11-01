import axiosAdmin from "@/lib/axiosAdmin";

// 1. Lấy danh sách phiếu nhập / xuất kho (lọc theo type, tìm kiếm, phân trang)
export async function getStockDocuments(params = {}) {
  const res = await axiosAdmin.get("/admin/stock-documents", { params });
  return res;
}

// 2. Lấy thông tin chi tiết một phiếu kho theo ID (kèm danh sách mặt hàng)
export async function getStockDocumentById(id) {
  const res = await axiosAdmin.get(`/admin/stock-documents/${id}`);
  return res.data || res;
}

// 3. Tạo mới phiếu nhập kho hoặc xuất kho
export async function createStockDocument(data) {
  const res = await axiosAdmin.post("/admin/stock-documents", data);
  return res.data || res;
}

// 4. Lấy danh sách nhà cung cấp (dùng cho dropdown khi lập phiếu nhập)
export async function getSuppliers(params = {}) {
  const res = await axiosAdmin.get("/admin/suppliers", { params });
  return res?.data?.data || res?.data || res;
}

// 5. Xóa tạm phiếu kho (chuyển vào thùng rác)
export async function deleteStockDocument(id) {
  return await axiosAdmin.delete(`/admin/stock-documents/${id}`);
}

// 6. Lấy danh sách phiếu kho trong thùng rác
export async function getTrashStockDocuments(params = {}) {
  const res = await axiosAdmin.get("/admin/stock-documents/trash", { params });
  return res;
}

// 7. Khôi phục phiếu kho từ thùng rác
export async function restoreStockDocument(id) {
  return await axiosAdmin.patch(`/admin/stock-documents/${id}/restore`);
}

// 8. Xóa vĩnh viễn phiếu kho khỏi database
export async function forceDeleteStockDocument(id) {
  return await axiosAdmin.delete(`/admin/stock-documents/${id}/force`);
}
