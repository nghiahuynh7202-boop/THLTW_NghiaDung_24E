import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";

const ADMIN = "/admin/brands";

function extractList(res) {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.brands)) return res.brands;
    return [];
}

function extractItem(res) {
    return res?.data?.data ?? res?.data ?? res ?? null;
}

/* ---------- CLIENT (axiosClient) ---------- */
export async function getBrands(params = {}) {
    const res = await axiosClient.get("/brands", { params });
    return extractList(res);
}

export async function getBrand(id) {
    const res = await axiosClient.get(`/brands/${id}`);
    return extractItem(res);
}

/* ---------- ADMIN (axiosAdmin) ---------- */
export async function getAdminBrands(params = {}) {
    const res = await axiosAdmin.get(ADMIN, { params });
    return { data: extractList(res), meta: res?.meta };
}

export async function getBrandById(id) {
    try {
        const res = await axiosAdmin.get(`${ADMIN}/${id}`);
        return extractItem(res);
    } catch {
        const fallback = await axiosClient.get(`/brands/${id}`);
        return extractItem(fallback);
    }
}

export async function createBrand(data) {
    const res = await axiosAdmin.post(ADMIN, data);
    return { data: extractItem(res), message: res?.message };
}

export async function updateBrand(id, data) {
    let res;
    if (data instanceof FormData) {
        if (!data.has("_method")) {
            data.append("_method", "PUT");
        }
        res = await axiosAdmin.post(`${ADMIN}/${id}`, data);
    } else {
        res = await axiosAdmin.put(`${ADMIN}/${id}`, data);
    }
    return { data: extractItem(res), message: res?.message };
}

export async function deleteBrand(id) {
    const res = await axiosAdmin.delete(`${ADMIN}/${id}`);
    return { message: res?.message };
}

/* ---------- THÙNG RÁC ---------- */
export async function getTrashBrands(page = 1, pageSize = 10) {
    const res = await axiosAdmin.get(`${ADMIN}/trash`, {
        params: { page, per_page: pageSize },
    });
    const list = extractList(res);
    return {
        data: list,
        pagination: {
            total: res?.meta?.total ?? list.length,
            pageCount: res?.meta?.last_page ?? 1,
            currentPage: res?.meta?.current_page ?? page,
        },
    };
}

export async function restoreBrand(id) {
    const res = await axiosAdmin.patch(`${ADMIN}/${id}/restore`);
    return { message: res?.message };
}

export async function forceDeleteBrand(id) {
    const res = await axiosAdmin.delete(`${ADMIN}/${id}/force`);
    return { message: res?.message };
}
