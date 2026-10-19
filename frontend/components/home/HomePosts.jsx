"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { getPublicPosts } from "@/services/postServices";

// Dữ liệu mẫu dự phòng khi database chưa có bài viết
const SAMPLE_POSTS = [
  {
    id: 1,
    title: "Ý nghĩa của hoa hồng theo từng màu sắc trong tình yêu",
    slug: "y-nghia-hoa-hong-theo-tung-mau-sac",
    summary: "Mỗi màu sắc của hoa hồng lại mang một thông điệp tình cảm riêng biệt. Hãy khám phá để chọn được bó hoa hoàn hảo nhất cho người thương.",
    image: "/images/hoa.jpg",
    created_at: "2026-04-20",
    topic: { name: "Ý nghĩa hoa" },
  },
  {
    id: 2,
    title: "Cách giữ hoa tươi lâu tại nhà đơn giản và hiệu quả nhất",
    slug: "cach-giu-hoa-tuoi-lau-tai-nha",
    summary: "Bí quyết đơn giản giúp bình hoa của bạn luôn tươi tắn trên 7 ngày: từ cách tỉa cành, thay nước đến mẹo pha dinh dưỡng tự nhiên.",
    image: "/images/hoa.jpg",
    created_at: "2026-04-18",
    topic: { name: "Mẹo chăm hoa" },
  },
  {
    id: 3,
    title: "Top 5 mẫu hoa khai trương hồng phát mang lại may mắn 2026",
    slug: "top-5-mau-hoa-khai-truong-hong-phat",
    summary: "Hoa khai trương không chỉ là món quà chúc mừng mà còn mang ý nghĩa phong thủy tài lộc, giúp công việc kinh doanh khởi sắc rực rỡ.",
    image: "/images/hoa.jpg",
    created_at: "2026-04-15",
    topic: { name: "Xu hướng hoa" },
  },
];

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
          setPosts(SAMPLE_POSTS);
        }
      } catch (err) {
        console.error("Lỗi lấy bài viết:", err);
        setPosts(SAMPLE_POSTS);
      } finally {
        setLoading(false);
      }
    }

    void fetchPosts();
  }, []);

  const getImageUrl = (src) => {
    if (!src) return "/images/hoa.jpg";
    const s = String(src).trim();
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:")) {
      return s;
    }
    if (s.startsWith("/images/")) {
      return s;
    }
    const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
    const clean = s.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://${hostname}:8000/storage/${clean}`;
  };

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

  const list = posts.length > 0 ? posts : SAMPLE_POSTS;

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
        {list.map((item) => {
          const postUrl = `/posts/${item.slug || item.id}`;
          const topicName = item.topic?.name || "Tin tức";

          return (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* Hình ảnh bài viết */}
              <Link href={postUrl} className="relative block h-48 overflow-hidden bg-gray-50">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/hoa.jpg";
                  }}
                />
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
