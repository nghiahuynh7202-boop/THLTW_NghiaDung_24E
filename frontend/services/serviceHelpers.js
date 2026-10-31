/**
 * Helper dùng chung để chuẩn hóa response từ Laravel API cho các service
 */

// Lấy mảng dữ liệu từ nhiều dạng response khác nhau của Laravel (Resource, Pagination, mảng trực tiếp)
export function extractList(res, key = null) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (key && Array.isArray(res?.[key])) return res[key];
  if (Array.isArray(res?.products)) return res.products;
  if (Array.isArray(res?.brands)) return res.brands;
  if (Array.isArray(res?.categories)) return res.categories;
  if (Array.isArray(res?.orders)) return res.orders;
  return [];
}

// Lấy 1 bản ghi từ response của Laravel
export function extractItem(res) {
  return res?.data?.data ?? res?.data ?? res ?? null;
}
