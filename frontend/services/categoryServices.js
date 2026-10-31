import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";
// 1. Lấy danh sách danh mục công khai (Frontend Shop)
export async function getPublicCategories() {
    try {
        const res = await axiosClient.get("/categories", { params: { per_page: 100 } });
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data)) return res.data;
        return [];
    } catch (err) {
        console.error("Lỗi getPublicCategories:", err);
        return [];
    }
}
// 2. Lấy danh sách danh mục cho Admin (lấy toàn bộ cả danh mục cha và con)
export async function getCategories(params) {
    return axiosAdmin.get("/admin/categories", { params });
}
// 3. Lấy chi tiết danh mục theo ID
export async function getCategory(id) {
    const res = await axiosClient.get(`/categories/${id}`);
    return res?.data?.data ?? res?.data ?? res ?? null;
}
export async function getCategoryById(id) {
    try {
        const res = await axiosAdmin.get(`/admin/categories/${id}`);
        return res?.data?.data ?? res?.data ?? res ?? null;
    } catch {
        const res = await axiosClient.get(`/categories/${id}`);
        return res?.data?.data ?? res?.data ?? res ?? null;
    }
}
// 3. Thêm mới danh mục (Admin)
export async function createCategory(data) {
    return axiosAdmin.post("/admin/categories", data);
}
// 4. Cập nhật danh mục (Admin - spoofing _method: PUT cho FormData)
export async function updateCategory(id, data) {
    if (data instanceof FormData) {
        if (!data.has("_method")) {
            data.append("_method", "PUT"); // Spoofing cho Laravel khi có upload file
        }
        return axiosAdmin.post(`/admin/categories/${id}`, data);
    }
    return axiosAdmin.put(`/admin/categories/${id}`, data);
}
// 5. Xóa tạm danh mục vào thùng rác (Admin)
export async function deleteCategory(id) {
    return axiosAdmin.delete(`/admin/categories/${id}`);
}
// 6. Lấy danh mục trong thùng rác (Admin)
export async function getTrashCategories(page = 1, pageSize = 10) {
    return axiosAdmin.get("/admin/categories/trash", {
        params: { page, per_page: pageSize },
    });
}
// 7. Khôi phục danh mục từ thùng rác (Admin)
export async function restoreCategory(id) {
    return axiosAdmin.patch(`/admin/categories/${id}/restore`);
}
// 8. Xóa vĩnh viễn danh mục (Admin)
export async function forceDeleteCategory(id) {
    return axiosAdmin.delete(`/admin/categories/${id}/force`);
}
