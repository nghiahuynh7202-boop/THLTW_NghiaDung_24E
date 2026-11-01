"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTopic } from "@/services/topicServices";
import { FolderTree, ArrowLeft, Plus } from "lucide-react";

export default function CreateTopicPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: 1,
  });

  const handleNameChange = (nameVal) => {
    const slug = nameVal
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setForm((prev) => ({
      ...prev,
      name: nameVal,
      slug: slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Vui lòng nhập tên chủ đề");

    setSubmitting(true);
    try {
      await createTopic({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description ? form.description.trim() : null,
        status: Number(form.status),
      });

      alert("✅ Thêm chủ đề mới thành công!");
      router.push("/admin/post-topics");
    } catch (err) {
      console.error("Lỗi thêm chủ đề:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi thêm chủ đề";
      alert("❌ " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/post-topics"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-[#f68b1f]" />
              Thêm Chủ Đề Mới
            </h1>
            <p className="text-sm text-gray-500">Tạo chủ đề phân loại bài viết</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên chủ đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Mẹo chăm sóc hoa, Ý nghĩa các loài hoa..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#f68b1f]"
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
              placeholder="meo-cham-soc-hoa"
              className="w-full px-4 py-2.5 text-sm font-mono text-gray-600 rounded-xl border border-gray-200 focus:outline-none focus:border-[#f68b1f]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Mô tả chủ đề
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả tóm tắt về nhóm bài viết này..."
              className="w-full p-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#f68b1f]"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white"
            >
              <option value={1}>Hiển thị</option>
              <option value={0}>Tạm ẩn</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/post-topics"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#f68b1f] hover:bg-[#e67300] rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Đang lưu..." : "Thêm Chủ Đề"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
