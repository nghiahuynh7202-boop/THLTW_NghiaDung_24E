"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Image as ImageIcon } from "lucide-react";
import { getPublicPosts } from "@/services/postServices";

function PostImage({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  const getImageUrl = (img) => {
    if (!img) return "";
    const s = String(img).trim();
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:") || s.startsWith("/images/")) {
      return s;
    }
    const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
    const clean = s.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://${hostname}:8000/storage/${clean}`;
  };

  const url = getImageUrl(src);

  if (!src || hasError || !url) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
        <ImageIcon className="w-10 h-10 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
      onError={() => setHasError(true)}
    />
  );
}

export default function HomePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const data = await getPublicPosts({ per_page: 3 });
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data.slice(0, 3));
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Lỗi lấy bài viết:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchPosts();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Mới cập nhật";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Nếu đang tải hoặc không có bài viết thực tế thì ẩn khu vực này
  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section className="space-y-5 pt-4 pb-2">
      {/* Tiêu đề & Nút xem tất cả */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-[#222222] text-base sm:text-lg font-bold uppercase tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-4.5 bg-[#8b5cf6] rounded-full inline-block" />
          <span>BÀI VIẾT & TIN TỨC HOA TƯƠI</span>
        </h2>

        <Link
          href="/posts"
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Danh sách 3 bài viết dạng lưới */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((item) => {
          const postUrl = `/posts/${item.slug || item.id}`;
          const topicName = item.topic?.name || "Tin tức";

          return (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* Hình ảnh bài viết */}
              <Link href={postUrl} className="relative block h-48 overflow-hidden bg-gray-50">
                <PostImage src={item.image} alt={item.title} />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#8b5cf6] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {topicName}
                </span>
              </Link>

              {/* Nội dung bài viết */}
              <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>

                  <Link href={postUrl}>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-[#8b5cf6] transition-colors mb-2">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                    {item.summary || "Khám phá những mẹo hay và xu hướng hoa tươi mới nhất từ Hoa Yêu Thương..."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50">
                  <Link
                    href={postUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b5cf6] group-hover:gap-2 transition-all"
                  >
                    <span>Đọc tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
