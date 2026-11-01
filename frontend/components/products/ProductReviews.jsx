"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageSquare, Send, Loader2, CheckCircle2, AlertCircle, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProductReviews, createReview } from "@/services/reviewServices";

export default function ProductReviews({ productId }) {
  const { user } = useAuth();

  const [reviewsData, setReviewsData] = useState({
    avg_rating: 5.0,
    total_reviews: 0,
    rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: { data: [] },
  });

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 1. Tải danh sách đánh giá của sản phẩm
  const loadReviews = async (page = 1) => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await getProductReviews(productId, { page, per_page: 5 });
      setReviewsData(data);
      setCurrentPage(page);
    } catch (err) {
      console.error("Lỗi tải reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(1);
  }, [productId]);

  // 2. Gửi đánh giá mới
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!user) {
      setErrorMsg("Vui lòng đăng nhập để gửi đánh giá sản phẩm!");
      return;
    }

    if (!comment.trim()) {
      setErrorMsg("Vui lòng nhập nội dung nhận xét của bạn!");
      return;
    }

    setSubmitting(true);
    try {
      await createReview(productId, {
        rating,
        comment: comment.trim(),
      });

      setSuccessMsg("Cảm ơn bạn! Đánh giá của bạn đã được đăng thành công.");
      setComment("");
      setRating(5);
      // Tải lại danh sách review mới nhất
      loadReviews(1);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const { avg_rating, total_reviews, rating_breakdown, reviews } = reviewsData;
  const reviewList = reviews?.data || [];
  const lastPage = reviews?.last_page || 1;

  return (
    <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-8 font-sans shadow-2xs">
      {/* Tiêu đề mục */}
      <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#f68b1f]" />
          <span>ĐÁNH GIÁ & NHẬN XÉT SẢN PHẨM</span>
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          ({total_reviews} lượt đánh giá)
        </span>
      </div>

      {/* =========================================================================
          KHỐI 1: TỔNG QUAN ĐIỂM SỐ & DÃY SAO (RATING OVERVIEW)
      ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-orange-50/40 p-5 sm:p-6 rounded-xl border border-orange-100">
        {/* Cột trái: Điểm số trung bình to */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-orange-100 pb-4 md:pb-0 md:pr-4">
          <div className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            {Number(avg_rating).toFixed(1)}
            <span className="text-base sm:text-lg text-gray-400 font-normal"> / 5</span>
          </div>

          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(avg_rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Dựa trên <strong>{total_reviews}</strong> lượt đánh giá thực tế
          </p>
        </div>

        {/* Cột phải: Thanh tiến trình phân bổ theo từng mức sao */}
        <div className="md:col-span-8 space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = rating_breakdown?.[star] || 0;
            const percent = total_reviews > 0 ? Math.round((count / total_reviews) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 w-14 shrink-0 text-gray-600 font-medium">
                  <span>{star}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                {/* Thanh tiến trình */}
                <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Số lượng & phần trăm */}
                <span className="w-16 text-right text-gray-500 shrink-0 font-medium">
                  {count} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          KHỐI 2: FORM GỬI ĐÁNH GIÁ MỚI
      ========================================================================= */}
      <div className="bg-gray-50/70 p-5 sm:p-6 rounded-xl border border-gray-200 space-y-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
          GỬI ĐÁNH GIÁ CỦA BẠN
        </h3>

        {/* Thông báo thành công */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Thông báo lỗi */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
            {/* Chọn số sao */}
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Mức độ hài lòng:</span>
              <div className="flex items-center gap-1 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="font-bold text-amber-600 text-xs">
                {rating === 5 && "Cực kỳ hài lòng"}
                {rating === 4 && "Hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 2 && "Không hài lòng"}
                {rating === 1 && "Rất tệ"}
              </span>
            </div>

            {/* Ô nhập nhận xét */}
            <div>
              <textarea
                rows={3}
                required
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về độ tươi, cách cắm và thời gian giao hoa..."
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f68b1f] resize-none"
              />
              <div className="text-right text-[11px] text-gray-400 mt-0.5">
                {comment.length} / 1000 ký tự
              </div>
            </div>

            {/* Nút gửi */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#f68b1f] hover:bg-[#e67300] text-white font-bold rounded-lg text-xs uppercase transition shadow-xs flex items-center gap-1.5 disabled:opacity-60 cursor-pointer active:scale-98"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>ĐANG GỬI...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>GỬI ĐÁNH GIÁ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center space-y-2">
            <p className="text-gray-600 text-xs">
              Bạn cần đăng nhập tài khoản khách hàng để có thể gửi đánh giá cho sản phẩm này.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f68b1f] hover:bg-[#e67300] text-white rounded-lg font-bold text-xs uppercase transition"
            >
              ĐĂNG NHẬP ĐỂ ĐÁNH GIÁ
            </Link>
          </div>
        )}
      </div>

      {/* =========================================================================
          KHỐI 3: DANH SÁCH CÁC ĐÁNH GIÁ CỦA KHÁCH HÀNG
      ========================================================================= */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
          BÌNH LUẬN TỪ KHÁCH HÀNG ({total_reviews})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#f68b1f]" />
            <span>Đang tải nhận xét...</span>
          </div>
        ) : reviewList.length > 0 ? (
          <div className="space-y-3.5 divide-y divide-gray-100">
            {reviewList.map((item) => (
              <div key={item.id} className="pt-3.5 first:pt-0 space-y-1.5">
                {/* Header người đánh giá */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Avatar tròn với chữ cái đầu */}
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-[#f68b1f] border border-orange-200 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {item.user?.name ? item.user.name.charAt(0) : "U"}
                    </div>

                    <div>
                      <p className="font-bold text-gray-800 text-xs">
                        {item.user?.name || "Khách hàng"}
                      </p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= item.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>

                {/* Nội dung nhận xét */}
                <p className="text-xs text-gray-700 leading-relaxed pl-10">
                  {item.comment}
                </p>
              </div>
            ))}

            {/* Phân trang danh sách review nếu có nhiều trang */}
            {lastPage > 1 && (
              <div className="pt-4 flex justify-center items-center gap-2 text-xs">
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => loadReviews(p)}
                    className={`w-7 h-7 rounded border font-semibold transition cursor-pointer ${
                      currentPage === p
                        ? "bg-[#f68b1f] text-white border-[#f68b1f]"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">
              Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
