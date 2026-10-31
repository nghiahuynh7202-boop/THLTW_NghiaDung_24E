"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { getPostById } from "@/services/postServices";

// Xử lý link ảnh
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

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await getPostById(slug);
        setPost(data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết bài viết:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        Đang tải bài viết...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-bold text-gray-700 mb-3">
          Không tìm thấy bài viết
        </h2>
        <Link
          href="/posts"
          className="px-4 py-2 bg-[#f68b1f] text-white text-xs font-semibold rounded-lg"
        >
          Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  const topicName = post.topic?.name || "Tin tức";
  const dateStr = post.created_at
    ? new Date(post.created_at).toLocaleDateString("vi-VN")
    : "Mới cập nhật";

  return (
    <div className="min-h-[75vh] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden p-6 sm:p-10">
        
        {/* Nút quay lại */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#f68b1f] font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tất cả bài viết</span>
        </Link>

        {/* Chủ đề bài viết */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-[#f68b1f] text-xs font-bold rounded-full uppercase">
            <Tag className="w-3 h-3" />
            <span>{topicName}</span>
          </span>
        </div>

        {/* Tiêu đề bài viết */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Thông tin tác giả & ngày đăng */}
        <div className="flex items-center gap-4 text-xs text-gray-400 border-b border-gray-100 pb-5 mb-6">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{post.user?.name || "Ban biên tập"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Ảnh đại diện bài viết */}
        {post.image && (
          <div className="rounded-xl overflow-hidden mb-6 bg-gray-100">
            <img
              src={resolveImgUrl(post.image)}
              alt={post.title}
              className="w-full max-h-[420px] object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/hoa.jpg";
              }}
            />
          </div>
        )}

        {/* Đoạn tóm tắt nếu có */}
        {post.summary && (
          <div className="p-4 bg-orange-50/50 rounded-xl border-l-4 border-[#f68b1f] text-sm text-gray-700 italic mb-6">
            {post.summary}
          </div>
        )}

        {/* Nội dung bài viết */}
        <div className="prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base space-y-4">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p>Nội dung đang được cập nhật...</p>
          )}
        </div>

        {/* Cuối bài viết */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
          <Link
            href="/posts"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#f68b1f] hover:text-[#e67300]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Xem các bài viết khác</span>
          </Link>
        </div>

      </article>
    </div>
  );
}
