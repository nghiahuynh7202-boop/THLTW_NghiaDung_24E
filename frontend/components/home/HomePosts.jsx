"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { getPublicPosts } from "@/services/postServices";

/**
 * COMPONENT: Tin Tức Trang Chủ (Hiển thị vừa vặn 3 bài viết trên 1 hàng ngang)
 * - Lấy đúng 3 bài viết từ MySQL qua API
 * - Chia 3 cột đều nhau (md:grid-cols-3) lấp đầy 100% chiều ngang trang
 * - Ảnh tỷ lệ chữ nhật ngang 16:10 thanh thoát, không bị vuông
 */
export default function HomePosts() {
  // BƯỚC 1: Khai báo State lưu dữ liệu 3 bài viết và trạng thái tải
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // BƯỚC 2: Gọi API lấy 3 bài viết mới nhất từ Database khi component load
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        // Lấy đúng 3 bài viết để dàn đều trên 1 hàng ngang 3 cột
        const data = await getPublicPosts({ per_page: 3 });
        const list = Array.isArray(data) ? data : [];
        // Sắp xếp bài viết mới nhất theo thời gian (created_at) lên đầu
        const sorted = [...list].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        setPosts(sorted.slice(0, 3));
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tin tức từ CSDL:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // BƯỚC 3: Hàm tiện ích định dạng ngày đăng chuẩn Việt Nam (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? dateString : d.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  // BƯỚC 4: Hàm xử lý đường dẫn ảnh từ Laravel Backend Storage
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/hoa.jpg";
    const path = String(imagePath).trim();
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/images/")) {
      return path;
    }
    const cleanPath = path.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  // Nếu đã tải xong nhưng trong MySQL chưa có bài viết nào thì ẩn khung
  if (!loading && posts.length === 0) {
    return null;
  }

  // BƯỚC 5: Giao diện hiển thị 3 bài viết dàn đều 3 cột trên 1 hàng ngang
  return (
    <section className="pt-4 pb-8 font-sans">
      {/* Tiêu đề mục: TIN TỨC + Nút xem tất cả */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-gray-900">
          TIN TỨC
        </h2>
        <Link
          href="/posts"
          className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#f68b1f] transition-colors flex items-center gap-1 group/link"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Hiệu ứng Skeleton khi đang tải dữ liệu (3 khung) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-4 space-y-3"
            >
              <div className="w-full aspect-[16/10] bg-gray-200 rounded-lg" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-1/4 pt-2" />
            </div>
          ))}
        </div>
      ) : (
        /* Danh sách 3 bài viết nằm vừa khít trên 1 hàng ngang (3 cột đều nhau) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* 1. Ảnh đại diện tỷ lệ chữ nhật 16:10 nằm ngang thanh thoát */}
              <Link
                href={`/posts/${post.slug || post.id}`}
                className="relative w-full aspect-[16/10] overflow-hidden bg-gray-50 block"
              >
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/images/hoa.jpg";
                  }}
                />
              </Link>

              {/* 2. Thông tin bài viết */}
              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                <div>
                  {/* Ngày đăng */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>

                  {/* Tiêu đề bài viết */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#f68b1f] transition-colors line-clamp-2 leading-snug mb-2">
                    <Link href={`/posts/${post.slug || post.id}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Tóm tắt ngắn gọn */}
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {post.summary ||
                      (post.content ? post.content.replace(/<[^>]+>/g, "").slice(0, 100) : "") ||
                      "Nhấn để xem chi tiết bài viết..."}
                  </p>
                </div>

                {/* Nút Xem chi tiết ở góc dưới */}
                <div className="pt-3 mt-4 border-t border-gray-50 flex items-center justify-between">
                  <Link
                    href={`/posts/${post.slug || post.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#f68b1f] hover:underline"
                  >
                    <span>Chi tiết</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
