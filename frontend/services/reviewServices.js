import axiosClient from "@/lib/axiosClient";
import axiosAdmin from "@/lib/axiosAdmin";

/**
 * 1. CLIENT: Lấy danh sách đánh giá & thống kê số sao của sản phẩm
 */
export async function getProductReviews(productId, params = {}) {
  try {
    const res = await axiosClient.get(`/products/${productId}/reviews`, { params });
    return res;
  } catch (err) {
    console.error("Lỗi lấy đánh giá sản phẩm:", err);
    return {
      avg_rating: 5.0,
      total_reviews: 0,
      rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: { data: [] },
    };
  }
}

/**
 * 2. CLIENT: Gửi đánh giá mới (Yêu cầu đã đăng nhập)
 */
export async function createReview(productId, data) {
  const res = await axiosClient.post(`/products/${productId}/reviews`, data);
  return res;
}

/**
 * 3. ADMIN: Lấy danh sách tất cả đánh giá (tìm kiếm, lọc sao, lọc trạng thái)
 */
export async function getAdminReviews(params = {}) {
  const res = await axiosAdmin.get("/admin/reviews", { params });
  return res;
}

/**
 * 4. ADMIN: Bật / Tắt trạng thái hiển thị đánh giá (1 <-> 0)
 */
export async function toggleReviewStatus(id) {
  const res = await axiosAdmin.patch(`/admin/reviews/${id}/toggle`);
  return res;
}

/**
 * 5. ADMIN: Xóa vĩnh viễn một đánh giá khỏi CSDL
 */
export async function deleteReview(id) {
  const res = await axiosAdmin.delete(`/admin/reviews/${id}`);
  return res;
}
