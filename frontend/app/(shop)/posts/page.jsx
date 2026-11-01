"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Image as ImageIcon, BookOpen } from "lucide-react";
import { getPublicPosts } from "@/services/postServices";

// Hàm xử lý đường dẫn ảnh từ Backend Laravel (lưu trong storage)
const resolveImgUrl = (rawImg) => {
  const raw = rawImg ? String(rawImg).trim() : "";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:") || raw.startsWith("/images/")) {
    return raw;
  }
  const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
  const clean = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `http://${hostname}:8000/storage/${clean}`;
};

// Component hiển thị ảnh bài viết
function PostImage({ src, alt, className = "" }) {
  const [hasError, setHasError] = useState(false);
  const url = resolveImgUrl(src);

  if (!url || hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}>
        <ImageIcon className="w-8 h-8 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt || "Bài viết"}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. KẾT NỐI VÀ LẤY DỮ LIỆU BÀI VIẾT TỪ CƠ SỞ DỮ LIỆU MYSQL
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        // Gọi API lấy bài viết từ MySQL
        const data = await getPublicPosts({ per_page: 20 });
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi kết nối API CSDL bài viết:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  // Định dạng ngày đăng
  const formatDate = (dateStr) => {
    if (!dateStr) return "Mới cập nhật";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  // Tách bài viết từ MySQL theo bố cục:
  // - Bài đầu tiên: Nổi bật bên trái
  // - 3 bài tiếp theo: Danh sách nhỏ bên phải
  // - Các bài còn lại: Hiển thị bên dưới
  const featuredPost = posts[0] || null;
  const sidePosts = posts.slice(1, 4);
  const remainingPosts = posts.slice(4);

  return (
    <div className="bg-white min-h-[75vh] py-8 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* TIÊU ĐỀ: TIN TỨC */}
        <div className="mb-6 pb-2 border-b-2 border-rose-600 inline-block">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-gray-900">
            TIN TỨC
          </h1>
        </div>

        {/* TRẠNG THÁI ĐANG TẢI */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Đang tải dữ liệu bài viết từ cơ sở dữ liệu...
          </div>
        ) : posts.length === 0 ? (
          /* TRƯỜNG HỢP DATABASE CHƯA CÓ BÀI VIẾT */
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 p-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Hiện chưa có bài viết nào trong cơ sở dữ liệu.</p>
            <p className="text-xs text-gray-400 mt-1">Vui lòng thêm bài viết trong trang quản trị Admin.</p>
          </div>
        ) : (
          <>
            {/* KHU VỰC CHÍNH 2 CỘT TỪ MYSQL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* CỘT TRÁI: BÀI VIẾT NỔI BẬT ĐẦU TIÊN TỪ MYSQL */}
              {featuredPost && (
                <article className="lg:col-span-7 group">
                  <Link
                    href={`/posts/${featuredPost.slug || featuredPost.id}`}
                    className="block overflow-hidden rounded-lg aspect-[16/11] bg-gray-100 shadow-xs"
                  >
                    <PostImage
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Ngày đăng */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-4 mb-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDate(featuredPost.created_at)}</span>
                  </div>

                  {/* Tiêu đề */}
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors leading-snug">
                    <Link href={`/posts/${featuredPost.slug || featuredPost.id}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  {/* Tóm tắt */}
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {featuredPost.summary ||
                      featuredPost.content?.replace(/<[^>]+>/g, "").slice(0, 160) ||
                      "Chi tiết bài viết..."}
                  </p>
                </article>
              )}

              {/* CỘT PHẢI: CÁC BÀI VIẾT TIẾP THEO TỪ MYSQL */}
              {sidePosts.length > 0 && (
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {sidePosts.map((item) => (
                    <article key={item.id} className="flex gap-4 items-start group">
                      {/* Ảnh nhỏ vuông */}
                      <Link
                        href={`/posts/${item.slug || item.id}`}
                        className="w-24 h-24 sm:w-28 sm:h-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 shadow-xs"
                      >
                        <PostImage
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Tiêu đề và ngày đăng */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                          <Link href={`/posts/${item.slug || item.id}`}>
                            {item.title}
                          </Link>
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

            </div>

            {/* CÁC BÀI VIẾT CÒN LẠI TỪ MYSQL (NẾU CÓ TRÊN 4 BÀI) */}
            {remainingPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6">
                  CÁC BÀI VIẾT KHÁC
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingPosts.map((item) => (
                    <article key={item.id} className="group">
                      <Link
                        href={`/posts/${item.slug || item.id}`}
                        className="block overflow-hidden rounded-md aspect-[16/10] bg-gray-100 shadow-xs mb-3"
                      >
                        <PostImage
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                        <Link href={`/posts/${item.slug || item.id}`}>
                          {item.title}
                        </Link>
                      </h4>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
