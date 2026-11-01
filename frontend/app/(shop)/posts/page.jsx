"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Folder,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { getPublicPostsWithPagination } from "@/services/postServices";
import { getPublicTopics } from "@/services/topicServices";
import API_CONFIG from "@/config/api";

// Xử lý link ảnh từ backend Laravel
const resolveImgUrl = (rawImg) => {
  const raw = rawImg ? String(rawImg).trim() : "";
  if (!raw) return "/images/hoa.jpg";
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("blob:") ||
    raw.startsWith("/images/")
  ) {
    return raw;
  }
  const clean = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `${API_CONFIG.ROOT_URL}/storage/${clean}`;
};

// Ước tính thời gian đọc dựa vào số lượng ký tự nội dung
const estimateReadTime = (content) => {
  if (!content) return "3 phút đọc";
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} phút đọc`;
};

// Định dạng ngày theo chuẩn Việt Nam (dd/mm/yyyy)
const formatDate = (dateStr) => {
  if (!dateStr) return "Mới cập nhật";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

// Loại bỏ dấu tiếng Việt để tìm kiếm không phân biệt có dấu / không dấu
const removeVietnameseTones = (str) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

export default function PostsPage() {
  // Dữ liệu danh sách bài viết & chủ đề
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Bộ lọc & Tìm kiếm & Phân trang
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Input gõ tìm kiếm
  const [selectedTopicId, setSelectedTopicId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 9,
  });

  // 1. TẢI DANH SÁCH CHỦ ĐỀ TỪ CSDL (POST_TOPICS)
  useEffect(() => {
    async function loadTopicsList() {
      try {
        setLoadingTopics(true);
        const data = await getPublicTopics({ per_page: 50 });
        setTopics(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi tải chủ đề bài viết:", err);
      } finally {
        setLoadingTopics(false);
      }
    }
    loadTopicsList();
  }, []);

  // 2. TẢI DANH SÁCH BÀI VIẾT KÈM TÌM KIẾM, LỌC CHỦ ĐỀ & PHÂN TRANG TỪ CSDL
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 9,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedTopicId !== "all") params.topic_id = selectedTopicId;

      const res = await getPublicPostsWithPagination(params);
      setPosts(res.data || []);
      if (res.meta) {
        setPagination({
          current_page: res.meta.current_page || 1,
          last_page: res.meta.last_page || 1,
          total: res.meta.total || (res.data ? res.data.length : 0),
          per_page: res.meta.per_page || 9,
        });
      }
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, selectedTopicId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Tự động tìm kiếm tức thì khi người dùng gõ phím (Live Search với debounce 250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchInput.trim();
      setKeyword(term);
      setCurrentPage(1);
      // Khi gõ tìm kiếm, tìm kiếm trên tất cả chuyên mục
      if (term && selectedTopicId !== "all") {
        setSelectedTopicId("all");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Xử lý nộp form tìm kiếm (bấm Enter hoặc click Tìm)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchInput.trim();
    setKeyword(term);
    setCurrentPage(1);
    if (term && selectedTopicId !== "all") {
      setSelectedTopicId("all");
    }
  };

  // Xóa từ khóa tìm kiếm
  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
    setSelectedTopicId("all");
    setCurrentPage(1);
  };

  // Chọn chủ đề lọc
  const handleSelectTopic = (topicId) => {
    setSelectedTopicId(topicId);
    setCurrentPage(1);
  };

  // Lọc thông minh tức thì hỗ trợ cả tiếng Việt không dấu, tiêu đề, tóm tắt, nội dung, chủ đề
  const displayedPosts = useMemo(() => {
    if (!keyword.trim()) return posts;
    const kwNorm = removeVietnameseTones(keyword);
    const kwRaw = keyword.toLowerCase().trim();

    return posts.filter((post) => {
      const titleNorm = removeVietnameseTones(post.title || "");
      const titleRaw = (post.title || "").toLowerCase();
      const summaryNorm = removeVietnameseTones(post.summary || "");
      const contentNorm = removeVietnameseTones(post.content || "");
      const topicNorm = removeVietnameseTones(post.topic?.name || "");
      const slugNorm = removeVietnameseTones(post.slug || "");

      return (
        titleNorm.includes(kwNorm) ||
        titleRaw.includes(kwRaw) ||
        slugNorm.includes(kwNorm) ||
        summaryNorm.includes(kwNorm) ||
        contentNorm.includes(kwNorm) ||
        topicNorm.includes(kwNorm)
      );
    });
  }, [posts, keyword]);

  // Tổng số lượng bài viết của tất cả chuyên mục
  const totalPostsCount = useMemo(() => {
    if (selectedTopicId === "all" && !keyword.trim()) {
      return pagination.total;
    }
    return topics.reduce((sum, t) => sum + Number(t.posts_count || 0), 0) || pagination.total;
  }, [topics, pagination.total, selectedTopicId, keyword]);

  return (
    <div className="bg-[#fafafa] min-h-screen py-8 px-4 sm:px-6 lg:px-12 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ======================================================== */}
        {/* 1. KHỐI TÌM KIẾM BÀI VIẾT (SEARCH BAR THEME CAM WEB) */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-orange-100 shadow-xs">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>Tìm kiếm bài viết</span>
          </h2>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 text-[#f68b1f] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập tiêu đề, chủ đề hoặc tag..."
              className="w-full pl-12 pr-24 py-3.5 text-sm sm:text-base border-2 border-orange-100 hover:border-orange-200 focus:border-[#f68b1f] rounded-2xl outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400 bg-white shadow-xs focus:ring-4 focus:ring-orange-500/10"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#f68b1f] hover:bg-[#e67300] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* ======================================================== */}
        {/* 2. KHUNG NỘI DUNG 2 CỘT: CHUYÊN MỤC (TRÁI) + DANH SÁCH (PHẢI) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* --- CỘT TRÁI: CHUYÊN MỤC BÀI VIẾT --- */}
          <aside className="md:col-span-4 lg:col-span-3 bg-white rounded-2xl p-4 border border-orange-100 shadow-xs md:sticky md:top-20 space-y-2">
            <div className="flex items-center gap-2.5 pb-3 border-b border-orange-50 text-slate-900 px-2 pt-1">
              <Folder className="w-5 h-5 text-[#f68b1f]" />
              <h3 className="font-bold text-sm sm:text-base tracking-tight">
                Chuyên mục bài viết
              </h3>
            </div>

            <nav className="space-y-1 pt-1 max-h-[70vh] overflow-y-auto pr-1">
              {/* Mục: Tất cả bài viết */}
              <button
                type="button"
                onClick={() => handleSelectTopic("all")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  selectedTopicId === "all"
                    ? "bg-[#f68b1f] text-white shadow-xs"
                    : "text-slate-700 hover:bg-orange-50/60 hover:text-[#f68b1f]"
                }`}
              >
                <span className="truncate">Tất cả bài viết</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    selectedTopicId === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {totalPostsCount}
                </span>
              </button>

              {/* Danh sách chủ đề lấy từ MySQL */}
              {loadingTopics ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin text-[#f68b1f]" />
                  <span>Đang tải chuyên mục...</span>
                </div>
              ) : (
                topics.map((item) => {
                  const isSelected = String(selectedTopicId) === String(item.id);
                  const count = item.posts_count ?? 0;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTopic(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                        isSelected
                          ? "bg-[#f68b1f] text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-orange-50/60 hover:text-[#f68b1f] font-medium"
                      }`}
                    >
                      <span className="truncate text-left">{item.name}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })
              )}
            </nav>
          </aside>

          {/* --- CỘT PHẢI: LƯỚI BÀI VIẾT (3 CỘT) --- */}
          <main className="md:col-span-8 lg:col-span-9 space-y-5">
            {/* Thanh tiêu đề thống kê số lượng */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1">
              <span>
                Tìm thấy{" "}
                <strong className="text-slate-900 font-bold">
                  {keyword.trim() ? displayedPosts.length : pagination.total}
                </strong>{" "}
                bài viết
                {keyword ? ` cho từ khóa "${keyword}"` : ""}
              </span>

              {(selectedTopicId !== "all" || keyword) && (
                <button
                  onClick={() => {
                    setSelectedTopicId("all");
                    setKeyword("");
                    setSearchInput("");
                    setCurrentPage(1);
                  }}
                  className="text-[#f68b1f] hover:text-[#e67300] hover:underline text-xs font-semibold flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Trạng thái tải bài viết */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200/70 p-4 space-y-3 animate-pulse shadow-xs"
                  >
                    <div className="w-full aspect-[16/10] bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-5 bg-slate-100 rounded w-3/4" />
                    <div className="h-12 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : displayedPosts.length === 0 ? (
              /* Trạng thái rỗng không tìm thấy bài viết */
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">
                  Không tìm thấy bài viết nào phù hợp
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn chuyên mục khác để xem thêm bài viết.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopicId("all");
                    setKeyword("");
                    setSearchInput("");
                    setCurrentPage(1);
                  }}
                  className="mt-2 px-4 py-2 bg-[#f68b1f] hover:bg-[#e67300] text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  Xem tất cả bài viết
                </button>
              </div>
            ) : (
              /* Lưới 3 cột các thẻ bài viết */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedPosts.map((post) => {
                  const topicName = post.topic?.name || "Tin tức";
                  const postUrl = `/posts/${post.slug || post.id}`;
                  const postSummary =
                    post.summary ||
                    post.content?.replace(/<[^>]*>?/gm, "").slice(0, 120) ||
                    "Đang cập nhật nội dung chi tiết của bài viết...";
                  const readTime = estimateReadTime(post.content || post.summary);

                  return (
                    <article
                      key={post.id}
                      className="bg-white rounded-2xl border border-slate-200/80 hover:border-orange-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
                    >
                      {/* Ảnh bài viết kèm huy hiệu chủ đề */}
                      <Link href={postUrl} className="block relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={resolveImgUrl(post.image)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "/images/hoa.jpg";
                          }}
                        />
                        {/* Huy hiệu chủ đề góc trên bên trái ảnh */}
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xs border border-orange-100/80">
                          {topicName}
                        </span>
                      </Link>

                      {/* Thân thẻ bài viết */}
                      <div className="p-4 flex-1 flex flex-col">
                        {/* Hàng ngày đăng & thời gian đọc */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(post.created_at)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {readTime}
                          </span>
                        </div>

                        {/* Tiêu đề bài viết */}
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug mt-2 line-clamp-2 group-hover:text-[#f68b1f] transition-colors">
                          <Link href={postUrl}>
                            {post.title}
                          </Link>
                        </h3>

                        {/* Tóm tắt nội dung */}
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-2">
                          {postSummary}
                        </p>

                        {/* Hashtag chủ đề */}
                        <div className="flex flex-wrap gap-1.5 mt-3 text-[11px] text-slate-400">
                          <span className="hover:text-[#f68b1f] cursor-pointer">
                            #{topicName.replace(/\s+/g, "")}
                          </span>
                        </div>

                        {/* Nút đọc bài viết */}
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            href={postUrl}
                            className="text-xs font-bold text-slate-900 group-hover:text-[#f68b1f] flex items-center gap-1.5 transition-colors"
                          >
                            <span>Đọc bài viết</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. PHÂN TRANG (PAGINATION) */}
            {/* ======================================================== */}
            {pagination.last_page > 1 && (
              <div className="pt-6 pb-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                {/* Nút Trước */}
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl font-medium text-slate-700 bg-white hover:bg-orange-50 hover:text-[#f68b1f] hover:border-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trước</span>
                </button>

                {/* Các số trang */}
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
                        {showEllipsis && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNumber);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`min-w-9 h-9 px-3 rounded-xl font-bold transition-all duration-200 ${
                            currentPage === pageNumber
                              ? "bg-[#f68b1f] text-white shadow-xs scale-105"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-orange-50 hover:text-[#f68b1f] hover:border-orange-200"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      </span>
                    );
                  })}

                {/* Nút Sau */}
                <button
                  type="button"
                  disabled={currentPage >= pagination.last_page}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(pagination.last_page, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl font-medium text-slate-700 bg-white hover:bg-orange-50 hover:text-[#f68b1f] hover:border-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
