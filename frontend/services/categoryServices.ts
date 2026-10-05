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
  pagination?: {
    total?: number;
    pageCount?: number;
    currentPage?: number;
  };
  message?: string;
}

// 1. Lấy danh sách danh mục (cho Admin)
export const getCategories = async (params: { page?: number; per_page?: number; search?: string } = {}) => {
  try {
    const res = (await axiosAdmin.get("/admin/categories", {
      params,
    })) as CategoryApiResponse<CategoryItem[]>;

    return {
      data: res?.data ?? res,
      meta: res?.meta,
    };
  } catch {
    // Fallback sang /categories nếu route admin chưa cấu hình quyền
    try {
      const fallbackRes = (await axiosAdmin.get("/categories", {
        params,
      })) as CategoryApiResponse<CategoryItem[]>;

      return {
        data: fallbackRes?.data ?? fallbackRes,
        meta: fallbackRes?.meta,
      };
    } catch (fallbackError) {
      console.error("Không thể tải danh sách danh mục:", fallbackError);
      return {
        data: [],
        meta: { total: 0, last_page: 1, current_page: 1 },
      };
    }
  }
};

// 2. Lấy chi tiết 1 danh mục
export const getCategory = async (id: number | string) => {
  const res = (await axiosAdmin.get(`/admin/categories/${id}`)) as { data?: CategoryItem } | CategoryItem;
  const item = (res && typeof res === "object" && "data" in res && res.data ? res.data : res) as CategoryItem;
  return {
    data: item,
  };
};

// 3. Thêm mới danh mục
export const createCategory = async (formData: FormData | Record<string, unknown>) => {
  const res = (await axiosAdmin.post("/admin/categories", formData)) as CategoryApiResponse<CategoryItem>;
  return {
    data: res?.data ?? res,
    message: res?.message,
  };
};

// 4. Cập nhật danh mục
export const updateCategory = async (id: number | string, formData: FormData | Record<string, unknown>) => {
  const isFormData = formData instanceof FormData;
  const url = `/admin/categories/${id}`;

  // Laravel yêu cầu _method: PUT khi gửi FormData chứa file
  if (isFormData && !formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  const payload = isFormData
    ? formData
    : { ...formData, _method: "PUT" };

  const res = (await axiosAdmin.post(url, payload)) as CategoryApiResponse<CategoryItem>;
  return {
    data: res?.data ?? res,
    message: res?.message,
  };
};

// 5. Xóa danh mục (chuyển vào thùng rác)
export const deleteCategory = async (id: number | string) => {
  const res = (await axiosAdmin.delete(`/admin/categories/${id}`)) as CategoryApiResponse;
  return {
    data: res?.data ?? res,
    message: res?.message,
  };
};

// 6. Lấy danh mục trong thùng rác
export const getTrashCategories = async (page: number = 1, pageSize: number = 10) => {
  const res = (await axiosAdmin.get("/admin/categories/trash", {
    params: {
      page,
      per_page: pageSize,
      pageSize,
    },
  })) as CategoryApiResponse<CategoryItem[]>;

  const list = res?.data ?? (Array.isArray(res) ? res : []);
  const meta = res?.meta;

  return {
    data: Array.isArray(list) ? list : [],
    pagination: {
      total: meta?.total ?? (Array.isArray(list) ? list.length : 0),
      pageCount: meta?.last_page ?? 1,
      currentPage: meta?.current_page ?? page,
    },
  };
};

// 7. Khôi phục danh mục từ thùng rác
export const restoreCategory = async (id: number | string) => {
  const res = (await axiosAdmin.patch(`/admin/categories/${id}/restore`)) as CategoryApiResponse<CategoryItem>;
  return {
    data: res?.data ?? res,
    message: res?.message,
  };
};

// 8. Xóa vĩnh viễn danh mục
export const forceDeleteCategory = async (id: number | string) => {
  const res = (await axiosAdmin.delete(`/admin/categories/${id}/force`)) as CategoryApiResponse;
  return {
    data: res?.data ?? res,
    message: res?.message,
  };
};
