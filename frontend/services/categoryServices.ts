const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

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

// Lấy danh sách danh mục (cho Admin)
export const getCategories = async (params: { page?: number; per_page?: number; search?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.per_page) query.append("per_page", params.per_page.toString());
  if (params.search) query.append("search", params.search);

  const res = await fetch(`${API_URL}/admin/categories?${query.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // Nếu API admin yêu cầu token hoặc chưa mở, fallback sang /categories
    const fallbackRes = await fetch(`${API_URL}/categories?${query.toString()}`, {
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });
    if (!fallbackRes.ok) {
      throw new Error("Không thể tải danh sách danh mục");
    }
    const data = await fallbackRes.json();
    return { data };
  }

  const data = await res.json();
  return { data };
};

// Lấy chi tiết 1 danh mục
export const getCategory = async (id: number | string) => {
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Không tìm thấy danh mục");
  const data = await res.json();
  return { data: data.data || data };
};

// Thêm mới danh mục
export const createCategory = async (formData: FormData | object) => {
  const isFormData = formData instanceof FormData;
  const res = await fetch(`${API_URL}/admin/categories`, {
    method: "POST",
    headers: isFormData
      ? { "Accept": "application/json" }
      : { "Content-Type": "application/json", "Accept": "application/json" },
    body: isFormData ? formData : JSON.stringify(formData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Thêm danh mục thất bại");
  }
  return { data: data.data || data };
};

// Cập nhật danh mục
export const updateCategory = async (id: number | string, formData: FormData | object) => {
  const isFormData = formData instanceof FormData;
  const url = `${API_URL}/admin/categories/${id}`;

  // Laravel yêu cầu _method: PUT khi gửi FormData chứa file
  if (isFormData && !formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  const res = await fetch(url, {
    method: "POST", // POST kèm _method: PUT cho FormData
    headers: isFormData
      ? { "Accept": "application/json" }
      : { "Content-Type": "application/json", "Accept": "application/json" },
    body: isFormData ? formData : JSON.stringify({ ...formData, _method: "PUT" }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Cập nhật danh mục thất bại");
  }
  return { data: data.data || data };
};

// Xóa danh mục
export const deleteCategory = async (id: number | string) => {
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Xóa danh mục thất bại");
  }
  return { data };
};
