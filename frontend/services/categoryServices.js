import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";

export async function getPublicCategories() {
  const res = await axiosClient.get("/categories", { params: { per_page: 100 } });
  return res.data || res || [];
}

export async function getCategories(params) {
  return await axiosAdmin.get("/admin/categories", { params });
}

export async function getCategory(id) {
  const res = await axiosClient.get(`/categories/${id}`);
  return res.data || res;
}

export async function getCategoryById(id) {
  const res = await axiosAdmin.get(`/admin/categories/${id}`);
  return res.data || res;
}

export async function createCategory(data) {
  return await axiosAdmin.post("/admin/categories", data);
}

export async function updateCategory(id, data) {
  if (data instanceof FormData && !data.has("_method")) {
    data.append("_method", "PUT");
    return await axiosAdmin.post(`/admin/categories/${id}`, data);
  }
  return await axiosAdmin.put(`/admin/categories/${id}`, data);
}

export async function deleteCategory(id) {
  return await axiosAdmin.delete(`/admin/categories/${id}`);
}

export async function getTrashCategories(page = 1, pageSize = 10) {
  return await axiosAdmin.get("/admin/categories/trash", {
    params: { page, per_page: pageSize },
  });
}

export async function restoreCategory(id) {
  return await axiosAdmin.patch(`/admin/categories/${id}/restore`);
}

export async function forceDeleteCategory(id) {
  return await axiosAdmin.delete(`/admin/categories/${id}/force`);
}
