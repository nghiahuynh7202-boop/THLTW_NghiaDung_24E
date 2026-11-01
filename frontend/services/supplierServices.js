import axiosAdmin from "@/lib/axiosAdmin";

const ADMIN = "/admin/suppliers";

/**
 * Lấy danh sách nhà cung cấp (hỗ trợ phân trang, tìm kiếm keyword, status)
 */
export async function getSuppliers(params = {}) {
  const res = await axiosAdmin.get(ADMIN, { params });
  let list = [];
  if (Array.isArray(res)) list = res;
  else if (Array.isArray(res?.data)) list = res.data;
  else if (Array.isArray(res?.data?.data)) list = res.data.data;

  return {
    data: list,
    meta: res?.meta || null,
  };
}

/**
 * Lấy chi tiết nhà cung cấp theo ID
 */
export async function getSupplierById(id) {
  const res = await axiosAdmin.get(`${ADMIN}/${id}`);
  return res.data || res;
}

/**
 * Thêm mới nhà cung cấp
 */
export async function createSupplier(data) {
  return await axiosAdmin.post(ADMIN, data);
}

/**
 * Cập nhật nhà cung cấp
 */
export async function updateSupplier(id, data) {
  if (data instanceof FormData && !data.has("_method")) {
    data.append("_method", "PUT");
    return await axiosAdmin.post(`${ADMIN}/${id}`, data);
  }
  return await axiosAdmin.put(`${ADMIN}/${id}`, data);
}

/**
 * Xóa tạm thời nhà cung cấp (chuyển vào thùng rác)
 */
export async function deleteSupplier(id) {
  return await axiosAdmin.delete(`${ADMIN}/${id}`);
}

/**
 * Lấy danh sách nhà cung cấp trong thùng rác
 */
export async function getTrashSuppliers(params = {}) {
  const res = await axiosAdmin.get(`${ADMIN}/trash`, { params });
  let list = [];
  if (Array.isArray(res)) list = res;
  else if (Array.isArray(res?.data)) list = res.data;
  else if (Array.isArray(res?.data?.data)) list = res.data.data;

  return {
    data: list,
    meta: res?.meta || null,
  };
}

/**
 * Khôi phục nhà cung cấp từ thùng rác
 */
export async function restoreSupplier(id) {
  return await axiosAdmin.patch(`${ADMIN}/${id}/restore`);
}

/**
 * Xóa vĩnh viễn nhà cung cấp
 */
export async function forceDeleteSupplier(id) {
  return await axiosAdmin.delete(`${ADMIN}/${id}/force`);
}
