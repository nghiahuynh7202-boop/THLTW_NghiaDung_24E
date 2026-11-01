import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";

const ADMIN = "/admin/brands";

export async function getBrands(params = {}) {
  const res = await axiosClient.get("/brands", { params });
  return res.data || res || [];
}

export const getActiveBrands = getBrands;

export async function getBrand(id) {
  const res = await axiosClient.get(`/brands/${id}`);
  return res.data || res;
}

export async function getAdminBrands(params = {}) {
  const res = await axiosAdmin.get(ADMIN, { params });
  return { data: res.data || res, meta: res.meta || null };
}

export async function getBrandById(id) {
  const res = await axiosAdmin.get(`${ADMIN}/${id}`);
  return res.data || res;
}

export async function createBrand(data) {
  return await axiosAdmin.post(ADMIN, data);
}

export async function updateBrand(id, data) {
  if (data instanceof FormData && !data.has("_method")) {
    data.append("_method", "PUT");
    return await axiosAdmin.post(`${ADMIN}/${id}`, data);
  }
  return await axiosAdmin.put(`${ADMIN}/${id}`, data);
}

export async function deleteBrand(id) {
  return await axiosAdmin.delete(`${ADMIN}/${id}`);
}

export async function getTrashBrands(page = 1, pageSize = 10) {
  const res = await axiosAdmin.get(`${ADMIN}/trash`, {
    params: { page, per_page: pageSize },
  });
  return {
    data: res.data || res,
    pagination: {
      total: res.meta?.total || 0,
      pageCount: res.meta?.last_page || 1,
      currentPage: res.meta?.current_page || page,
    },
  };
}

export async function restoreBrand(id) {
  return await axiosAdmin.patch(`${ADMIN}/${id}/restore`);
}

export async function forceDeleteBrand(id) {
  return await axiosAdmin.delete(`${ADMIN}/${id}/force`);
}
