"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPage } from "@/services/pageServices";
import { FileText, ArrowLeft, Plus } from "lucide-react";

export default function CreateSinglePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    description: "",
    status: 1,
  });

  const handleTitleChange = (titleVal) => {
    const slug = titleVal
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setForm((prev) => ({
      ...prev,
      title: titleVal,
      slug: slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Vui lòng nhập tiêu đề trang");
    if (!form.content.trim()) return alert("Vui lòng nhập nội dung trang");

    setSubmitting(true);
    try {
      await createPage({
        title: form.title.trim(),
        slug: form.slug.trim(),
        content: form.content.trim(),
        description: form.description ? form.description.trim() : null,
        status: Number(form.status),
      });

      alert("✅ Thêm trang đơn mới thành công!");
      router.push("/admin/pages");
    } catch (err) {
      console.error("Lỗi thêm trang đơn:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi thêm trang đơn";
      alert("❌ " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-teal-600" />
              Tạo Trang Đơn Mới
            </h1>
            <p className="text-sm text-gray-500">Soạn thảo trang tĩnh như Giới thiệu, Chính sách...</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tiêu đề trang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ví dụ: Giới thiệu Shop Hoa, Chính sách đổi trả..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Đường dẫn (Slug)
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="gioi-thieu-shop-hoa"
              className="w-full px-4 py-2.5 text-sm font-mono text-gray-600 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Mô tả ngắn gọn
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tóm tắt ngắn gọn nội dung trang..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={10}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Nhập nội dung đầy đủ của trang..."
              className="w-full p-4 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value={1}>Hiển thị</option>
              <option value={0}>Tạm ẩn</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/pages"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Đang lưu..." : "Tạo Trang Đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
