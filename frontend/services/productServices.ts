import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";

// Route admin. Collection Postman của bạn dùng /admin/products.
// Nếu route thật khác thì chỉ cần đổi dòng này (kiểm tra: php artisan route:list --path=products)
const ADMIN = "/admin/products";

export interface ProductItem {
  id: number;
  category_id?: number;
  brand_id?: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  qty?: number;
  image?: string | null;
  detail?: string;
  description?: string;
  status: number;
  created_at?: string;
  category?: { id: number; name: string } | null;
  brand?: { id: number; name: string } | null;
}

/* ---------- Hàm phụ ---------- */

// Lấy mảng từ nhiều kiểu response của Laravel
function extractList(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.products)) return res.products;
  return [];
}

// Lấy 1 object sản phẩm từ nhiều kiểu response
function extractItem(res: any): any {
  return res?.data?.data ?? res?.data ?? res ?? null;
}

/* ---------- PUBLIC (axiosClient) ---------- */
// axiosClient đã bóc response.data, nên res chính là body của Laravel

export async function getProducts(params: Record<string, unknown> = {}) {
  const res = await axiosClient.get("/products", { params });
  return extractList(res);
}

export async function getProductById(id: number | string) {
  const res = await axiosClient.get(`/products/${id}`);
  return extractItem(res);
}

export async function searchProducts(keyword: string, page = 1, pageSize = 10) {
  const res = await axiosClient.get("/searchProducts", {
    params: { q: keyword, page, pageSize },
  });
  return res;
}

// Lấy toàn bộ sản phẩm bằng cách đọc từng trang
export async function getAllProducts() {
  try {
    let all: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const res = (await axiosClient.get("/products", {
        params: { page, per_page: perPage },
      })) as any;

      const list = extractList(res);
      all = [...all, ...list];

      const lastPage = res?.meta?.last_page ?? res?.pagination?.last_page;
      const isLast = lastPage ? page >= lastPage : list.length < perPage;
      if (isLast) break;

      page++;
    }

    return all;
  } catch (error: any) {
    console.error("Lỗi lấy toàn bộ sản phẩm:", error?.message);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await axiosClient.get(`/products/${slug}`);
    const product = extractItem(res);
    if (product && product.id) return product;
    throw new Error("Dữ liệu sản phẩm không hợp lệ");
  } catch {
    // Dự phòng: tìm trong danh sách đầy đủ
    try {
      const all = await getAllProducts();
      return (
        all.find(
          (p) => String(p.slug) === String(slug) || String(p.id) === String(slug)
        ) || null
      );
    } catch {
      return null;
    }
  }
}

export async function getCategoriesByPageSize(params: Record<string, unknown> = {}) {
  const res = await axiosClient.get("/categories", { params });
  return extractList(res);
}

export async function getNotParentCategories() {
  const res = await axiosClient.get("/notParentCategories");
  return extractList(res);
}

/* ---------- ADMIN (axiosAdmin, cần token) ---------- */

// Danh sách cho admin (gồm cả sản phẩm đang ẩn)
export async function getAdminProducts(params: Record<string, unknown> = {}) {
  const res = (await axiosAdmin.get(ADMIN, { params })) as any;
  return { data: extractList(res), meta: res?.meta };
}

export async function getAdminProductById(id: number | string) {
  const res = await axiosAdmin.get(`${ADMIN}/${id}`);
  return extractItem(res);
}

export async function createProduct(data: FormData | Record<string, unknown>) {
  const res = (await axiosAdmin.post(ADMIN, data)) as any;
  return { data: extractItem(res), message: res?.message };
}

export async function updateProduct(id: number | string, data: FormData | Record<string, unknown>) {
  let res: any;
  if (data instanceof FormData) {
    // PHP không đọc được multipart khi gửi PUT nên POST kèm _method
    if (!data.has("_method")) data.append("_method", "PUT");
    res = await axiosAdmin.post(`${ADMIN}/${id}`, data);
  } else {
    res = await axiosAdmin.put(`${ADMIN}/${id}`, data);
  }
  return { data: extractItem(res), message: res?.message };
}

export async function deleteProduct(id: number | string) {
  const res = (await axiosAdmin.delete(`${ADMIN}/${id}`)) as any;
  return { message: res?.message };
}

/* ---------- Thùng rác ---------- */

export async function getTrashProducts(page = 1, pageSize = 10) {
  const res = (await axiosAdmin.get(`${ADMIN}/trash`, {
    params: { page, per_page: pageSize },
  })) as any;
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

export async function restoreProduct(id: number | string) {
  const res = (await axiosAdmin.patch(`${ADMIN}/${id}/restore`)) as any;
  return { message: res?.message };
}

export async function forceDeleteProduct(id: number | string) {
  const res = (await axiosAdmin.delete(`${ADMIN}/${id}/force`)) as any;
  return { message: res?.message };
}
