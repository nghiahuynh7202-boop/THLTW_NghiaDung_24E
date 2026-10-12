import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";
// 1. Lấy danh sách danh mục cho Admin (lấy toàn bộ cả danh mục cha và con)
export async function getCategories(params) {
    return axiosAdmin.get("/admin/categories", { params });
}
// 2. Lấy chi tiết danh mục theo ID
export async function getCategory(id) {
    return axiosClient.get(`/categories/${id}`);
}
export async function getCategoryById(id) {
    return axiosClient.get(`/categories/${id}`);
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
