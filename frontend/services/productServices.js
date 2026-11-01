import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";

// Lấy danh sách sản phẩm cho khách (hỗ trợ lọc ?category_id=... hoặc ?is_featured=1)
export async function getProducts(params = {}) {
  const res = await axiosClient.get("/products", { params });
  return res.data || res;
}

// Lấy toàn bộ sản phẩm (tương thích các trang gọi getAllProducts)
export async function getAllProducts(params = {}) {
  return await getProducts({ per_page: 1000, ...params });
}

// Lấy danh mục con (tương thích admin/products/create)
export async function getNotParentCategories() {
  const res = await axiosClient.get("/notParentCategories");
  return res.data || res;
}

// Lấy chi tiết sản phẩm theo id hoặc slug
export async function getProductById(id) {
  const res = await axiosClient.get(`/products/${id}`);
  return res.data || res;
}

export async function getProductBySlug(slug) {
  const res = await axiosClient.get(`/products/${slug}`);
  return res.data || res;
}

// Lấy danh sách sản phẩm cho admin (kèm phân trang)
export async function getAdminProducts(params = {}) {
  const res = await axiosAdmin.get("/admin/products", { params });
  return {
    data: res.data || res,
    meta: res.meta || null,
  };
}

// Lấy chi tiết sản phẩm cho admin
export async function getAdminProductById(id) {
  const res = await axiosAdmin.get(`/admin/products/${id}`);
  return res.data || res;
}

// Thêm sản phẩm mới
export async function createProduct(data) {
  return await axiosAdmin.post("/admin/products", data);
}

// Cập nhật sản phẩm (dùng POST + _method: PUT nếu có upload ảnh)
export async function updateProduct(id, data) {
  if (data instanceof FormData && !data.has("_method")) {
    data.append("_method", "PUT");
    return await axiosAdmin.post(`/admin/products/${id}`, data);
  }
  return await axiosAdmin.put(`/admin/products/${id}`, data);
}

// Xóa tạm sản phẩm vào thùng rác
export async function deleteProduct(id) {
  return await axiosAdmin.delete(`/admin/products/${id}`);
}

// Lấy danh sách thùng rác
export async function getTrashProducts(params = {}) {
  const res = await axiosAdmin.get("/admin/products/trash", { params });
  return {
    data: res.data || res,
    pagination: {
      total: res.meta?.total || 0,
      pageCount: res.meta?.last_page || 1,
      currentPage: res.meta?.current_page || 1,
    },
  };
}

// Khôi phục từ thùng rác
export async function restoreProduct(id) {
  return await axiosAdmin.patch(`/admin/products/${id}/restore`);
}

// Xóa vĩnh viễn khỏi database
export async function forceDeleteProduct(id) {
  return await axiosAdmin.delete(`/admin/products/${id}/force`);
}
