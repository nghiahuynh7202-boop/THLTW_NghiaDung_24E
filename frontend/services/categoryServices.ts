import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";

export interface CategoryItem {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image: string | null;
  is_featured: boolean | number;
  status: number;
  created_at?: string;
  parent?: CategoryItem | null;
  children?: CategoryItem[];
}

export interface CategoryApiResponse<T = unknown> {
  data?: T;
  meta?: {
    total?: number;
    last_page?: number;
    current_page?: number;
    per_page?: number;
  };
  message?: string;
}

// 1. Lấy danh sách danh mục cho Admin (lấy toàn bộ cả danh mục cha và con)
export async function getCategories(params?: Record<string, unknown>) {
  return axiosAdmin.get("/admin/categories", { params });
}

// 2. Lấy chi tiết danh mục theo ID
export async function getCategory(id: number | string) {
  return axiosClient.get(`/categories/${id}`);
}

export async function getCategoryById(id: number | string) {
  return axiosClient.get(`/categories/${id}`);
}

// 3. Thêm mới danh mục (Admin)
export async function createCategory(data: FormData | Record<string, unknown>) {
  return axiosAdmin.post("/admin/categories", data);
}

// 4. Cập nhật danh mục (Admin - spoofing _method: PUT cho FormData)
export async function updateCategory(id: number | string, data: FormData | Record<string, unknown>) {
  if (data instanceof FormData) {
    if (!data.has("_method")) {
      data.append("_method", "PUT"); // Spoofing cho Laravel khi có upload file
    }
    return axiosAdmin.post(`/admin/categories/${id}`, data);
  }
  return axiosAdmin.put(`/admin/categories/${id}`, data);
}

// 5. Xóa tạm danh mục vào thùng rác (Admin)
export async function deleteCategory(id: number | string) {
  return axiosAdmin.delete(`/admin/categories/${id}`);
}

// 6. Lấy danh mục trong thùng rác (Admin)
export async function getTrashCategories(page: number = 1, pageSize: number = 10) {
  return axiosAdmin.get("/admin/categories/trash", {
    params: { page, per_page: pageSize },
  });
}

// 7. Khôi phục danh mục từ thùng rác (Admin)
export async function restoreCategory(id: number | string) {
  return axiosAdmin.patch(`/admin/categories/${id}/restore`);
}

// 8. Xóa vĩnh viễn danh mục (Admin)
export async function forceDeleteCategory(id: number | string) {
  return axiosAdmin.delete(`/admin/categories/${id}/force`);
}
