"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { getPublicPosts } from "@/services/postServices";

// Xử lý link ảnh bài viết
const resolveImgUrl = (rawImg) => {
  const raw = rawImg ? String(rawImg).trim() : "";
  if (!raw) return "/images/hoa.jpg";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:") || raw.startsWith("/images/")) {
    return raw;
  }
  const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
  const clean = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `http://${hostname}:8000/storage/${clean}`;
};

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách bài viết từ Backend API
  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const data = await getPublicPosts({ per_page: 12 });
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi tải bài viết:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  return (
    <div className="min-h-[75vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Tiêu đề trang bài viết */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 uppercase tracking-tight">
            Bài Viết & Tin Tức Hoa Tươi
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Khám phá những câu chuyện, kiến thức và ý nghĩa các loài hoa đẹp
          </p>
          <div className="w-16 h-1 bg-[#f68b1f] mx-auto mt-3 rounded-full" />
        </div>

        {/* Trạng thái đang tải */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            Đang tải danh sách bài viết...
          </div>
        ) : posts.length === 0 ? (
          /* Chưa có bài viết */
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-xs">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Hiện chưa có bài viết nào.</p>
            <Link
              href="/"
              className="inline-block mt-4 px-5 py-2 bg-[#f68b1f] text-white text-xs font-semibold rounded-lg"
            >
              Về trang chủ
            </Link>
          </div>
        ) : (
          /* Lưới danh sách bài viết */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((item) => {
              const postUrl = `/posts/${item.slug || item.id}`;
              const topicName = item.topic?.name || "Tin tức";
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleDateString("vi-VN")
                : "Mới cập nhật";

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group hover:-translate-y-1"
                >
                  {/* Ảnh đại diện bài viết */}
                  <Link href={postUrl} className="relative block h-48 overflow-hidden bg-gray-100">
                    <img
                      src={resolveImgUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/images/hoa.jpg";
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-[#f68b1f] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      {topicName}
                    </span>
                  </Link>

                  {/* Nội dung tóm tắt bài viết */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Ngày đăng */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                      </div>

                      {/* Tiêu đề bài viết */}
                      <h2 className="text-base font-bold text-gray-800 group-hover:text-[#f68b1f] transition-colors line-clamp-2 leading-snug">
                        <Link href={postUrl}>{item.title}</Link>
                      </h2>

                      {/* Tóm tắt */}
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                        {item.summary || item.content?.replace(/<[^>]+>/g, "").slice(0, 120) || "Đang cập nhật..."}
                      </p>
                    </div>

                    {/* Nút Xem chi tiết */}
                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <Link
                        href={postUrl}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#f68b1f] hover:text-[#e67300] transition-colors"
                      >
                        <span>Đọc tiếp</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
