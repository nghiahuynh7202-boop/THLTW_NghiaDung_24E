"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  User as UserIcon,
  Image as ImageIcon,
} from "lucide-react";
import {
  getAdminReviews,
  toggleReviewStatus,
  deleteReview,
} from "@/services/reviewServices";
import API_CONFIG from "@/config/api";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [keyword, setKeyword] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal xem chi tiết
  const [viewingReview, setViewingReview] = useState(null);

  // Modal xác nhận xóa
  const [deletingReview, setDeletingReview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Thông báo toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Helper lấy URL ảnh sản phẩm
  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("blob:")) return img;
    const clean = img.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `${API_CONFIG.ROOT_URL}/storage/${clean}`;
  };

  // Tải danh sách đánh giá từ API
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 10,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedRating !== "all") params.rating = selectedRating;
      if (selectedStatus !== "all") params.status = selectedStatus;

      const res = await getAdminReviews(params);
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      }

      setReviews(list);
      setPagination({
        current_page: Number(res?.current_page || res?.meta?.current_page || 1),
        last_page: Number(res?.last_page || res?.meta?.last_page || 1),
        total: Number(res?.total ?? res?.meta?.total ?? list.length),
        per_page: Number(res?.per_page || res?.meta?.per_page || 10),
      });
    } catch (error) {
      console.error("Lỗi khi tải danh sách đánh giá:", error);
      showToast("Không thể tải danh sách đánh giá!", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, selectedRating, selectedStatus]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Tìm kiếm (reset về trang 1)
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReviews();
  };

  // Bật/Tắt trạng thái hiển thị của đánh giá
  const handleToggle = async (item) => {
    try {
      const res = await toggleReviewStatus(item.id);
      const newStatus = item.status === 1 ? 0 : 1;
      setReviews((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: newStatus } : r))
      );
      showToast(
        res?.message || (newStatus === 1 ? "Đã hiển thị đánh giá" : "Đã ẩn đánh giá"),
        "success"
      );
    } catch (error) {
      console.error("Lỗi đổi trạng thái:", error);
      showToast("Không thể thay đổi trạng thái!", "error");
    }
  };

  // Xác nhận xóa đánh giá
  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    setIsDeleting(true);
    try {
      await deleteReview(deletingReview.id);
      showToast("Đã xóa đánh giá vĩnh viễn khỏi CSDL", "success");
      setDeletingReview(null);
      // Tải lại danh sách
      fetchReviews();
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      showToast("Không thể xóa đánh giá, vui lòng thử lại!", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format ngày giờ Việt Nam
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Quản lý đánh giá & nhận xét sản phẩm
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Duyệt, lọc và quản lý phản hồi, số sao đánh giá từ khách hàng trên cửa hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchReviews();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Thanh bộ lọc & Tìm kiếm */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Ô tìm kiếm */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, khách hàng, nội dung..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Lọc theo số sao */}
          <div className="md:col-span-3">
            <select
              value={selectedRating}
              onChange={(e) => {
                setSelectedRating(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">Tất cả số sao (1 - 5 ⭐)</option>
              <option value="5">5 sao (⭐⭐⭐⭐⭐)</option>
              <option value="4">4 sao (⭐⭐⭐⭐)</option>
              <option value="3">3 sao (⭐⭐⭐)</option>
              <option value="2">2 sao (⭐⭐)</option>
              <option value="1">1 sao (⭐)</option>
            </select>
          </div>

          {/* Lọc theo trạng thái */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Hiển thị công khai</option>
              <option value="0">Đang ẩn / Vi phạm</option>
            </select>
          </div>

          {/* Nút lọc */}
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              Lọc
            </button>
          </div>
        </form>
      </div>

      {/* Bảng danh sách đánh giá */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[200px]">Sản phẩm</th>
                <th className="py-3 px-4 min-w-[160px]">Khách hàng</th>
                <th className="py-3 px-3 w-28 text-center">Số sao</th>
                <th className="py-3 px-4 min-w-[240px]">Nội dung nhận xét</th>
                <th className="py-3 px-3 w-36">Ngày gửi</th>
                <th className="py-3 px-3 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-4 w-28 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                      <span>Đang tải danh sách đánh giá...</span>
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="w-8 h-8 text-gray-300" />
                      <p className="text-gray-500 font-medium">Không tìm thấy đánh giá nào</p>
                      <p className="text-[11px] text-gray-400">
                        Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((item, index) => {
                  const stt = (pagination.current_page - 1) * pagination.per_page + index + 1;
                  const isVisible = item.status === 1;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/20 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-3 px-3 text-center text-gray-500 font-medium">
                        {stt}
                      </td>

                      {/* Sản phẩm */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-md border border-gray-200 overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
                            {item.product?.image ? (
                              <img
                                src={getImageUrl(item.product.image)}
                                alt={item.product?.name || "Product"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[180px] text-xs">
                              {item.product?.name || `Sản phẩm #${item.product_id}`}
                            </p>
                            {item.product?.slug && (
                              <Link
                                href={`/products/${item.product.slug}`}
                                target="_blank"
                                className="text-[11px] text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                Xem trên web
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-xs">
                              {item.user?.name || "Khách hàng"}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {item.user?.email || `ID: #${item.user_id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Số sao */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= item.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-amber-700 mt-0.5">
                            {item.rating}/5 sao
                          </span>
                        </div>
                      </td>

                      {/* Nội dung nhận xét */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setViewingReview(item)}
                          className="cursor-pointer group-hover:text-gray-900"
                          title="Bấm để xem chi tiết"
                        >
                          <p className="text-gray-700 line-clamp-2 leading-relaxed">
                            {item.comment}
                          </p>
                          {item.comment && item.comment.length > 90 && (
                            <span className="text-[10px] text-amber-600 hover:underline font-medium">
                              Xem thêm...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ngày gửi */}
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap text-[11px]">
                        {formatDate(item.created_at)}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3 text-center">
                        {isVisible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Hiển thị
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Đang ẩn
                          </span>
                        )}
                      </td>

                      {/* Hành động */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Toggle status */}
                          <button
                            onClick={() => handleToggle(item)}
                            title={isVisible ? "Bấm để ẩn đánh giá này" : "Bấm để hiển thị công khai"}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isVisible
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {isVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingReview(item)}
                            title="Xóa đánh giá vĩnh viễn"
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-gray-500">
              Hiển thị trang <strong className="text-gray-900">{pagination.current_page}</strong> /{" "}
              <strong>{pagination.last_page}</strong> (Tổng <strong>{pagination.total}</strong> đánh giá)
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700"
              >
                Trước
              </button>

              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === pagination.last_page ||
                    Math.abs(p - currentPage) <= 1
                  );
                })
                .map((pageNumber, idx, arr) => {
                  const showEllipsis = idx > 0 && pageNumber - arr[idx - 1] > 1;
                  return (
                    <span key={pageNumber} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`min-w-8 py-1.5 px-2.5 rounded-md font-semibold ${
                          currentPage === pageNumber
                            ? "bg-amber-500 text-white shadow-xs"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </span>
                  );
                })}

              <button
                disabled={currentPage >= pagination.last_page}
                onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT ĐÁNH GIÁ */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-bold text-gray-900 text-sm">
                  Chi tiết đánh giá #{viewingReview.id}
                </h3>
              </div>
              <button
                onClick={() => setViewingReview(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Sản phẩm */}
              <div>
                <label className="text-gray-500 font-medium block mb-1">Sản phẩm đánh giá:</label>
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 rounded-md border border-gray-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                    {viewingReview.product?.image ? (
                      <img
                        src={getImageUrl(viewingReview.product.image)}
                        alt={viewingReview.product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs">
                      {viewingReview.product?.name || `Sản phẩm #${viewingReview.product_id}`}
                    </p>
                    {viewingReview.product?.slug && (
                      <Link
                        href={`/products/${viewingReview.product.slug}`}
                        target="_blank"
                        className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        Mở liên kết sản phẩm <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Khách hàng & Thời gian */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block mb-1">Người đánh giá:</span>
                  <p className="font-bold text-gray-900">{viewingReview.user?.name || "Khách hàng"}</p>
                  <p className="text-gray-500 text-[11px] truncate">{viewingReview.user?.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-500 block mb-1">Thời gian gửi:</span>
                  <p className="font-bold text-gray-900">{formatDate(viewingReview.created_at)}</p>
                  <div className="mt-1">
                    {viewingReview.status === 1 ? (
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Hiển thị
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                        Đang ẩn
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Số sao */}
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 flex items-center justify-between">
                <span className="font-medium text-amber-900">Mức độ hài lòng:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= viewingReview.rating
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-bold text-amber-900 text-sm">
                    {viewingReview.rating}/5 sao
                  </span>
                </div>
              </div>

              {/* Nội dung nhận xét */}
              <div>
                <label className="text-gray-500 font-medium block mb-1">Nội dung nhận xét:</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {viewingReview.comment}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setViewingReview(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-gray-900 text-sm">Xác nhận xóa đánh giá?</h3>
              <p className="text-xs text-gray-500">
                Bạn có chắc chắn muốn xóa đánh giá của <strong>{deletingReview.user?.name || "khách hàng"}</strong>?
                Hành động này sẽ xóa vĩnh viễn và không thể khôi phục lại.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeletingReview(null)}
                className="flex-1 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
