"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

export default function SinglePageDetail() {
  const params = useParams();
  const slug = params?.slug;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy chi tiết trang đơn theo slug
  useEffect(() => {
    if (!slug) return;

    axiosClient
      .get(`/pages/${slug}`)
      .then((res) => {
        setPage(res?.data || res);
      })
      .catch((err) => {
        console.error("Lỗi tải trang đơn:", err);
        setPage(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">
        Đang tải nội dung...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          Không tìm thấy trang
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Trang bạn tìm kiếm không tồn tại hoặc đã bị ẩn.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f68b1f] text-white rounded-lg text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Nút quay lại trang chủ */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#f68b1f] mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
      </Link>

      {/* Khung nội dung trang */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
        {/* Tiêu đề trang */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {page.title}
        </h1>

        {/* Thời gian cập nhật */}
        {page.created_at && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6 pb-4 border-b border-gray-100">
            <Clock className="w-4 h-4" />
            <span>Ngày đăng: {new Date(page.created_at).toLocaleDateString("vi-VN")}</span>
          </div>
        )}

        {/* Tóm tắt nội dung */}
        {page.summary && (
          <div className="p-4 bg-orange-50 border-l-4 border-[#f68b1f] rounded-r-lg text-sm text-gray-700 mb-6 italic">
            {page.summary}
          </div>
        )}

        {/* Nội dung chi tiết */}
        <div
          className="text-gray-700 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: page.content || "" }}
        />
      </div>
    </div>
  );
}
