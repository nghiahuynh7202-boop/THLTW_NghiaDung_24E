"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPageById, updatePage } from "@/services/pageServices";
import { FileText, ArrowLeft, Save, RefreshCw } from "lucide-react";

function EditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    description: "",
    status: 1,
  });

  useEffect(() => {
    if (!id) {
      alert("Không tìm thấy trang cần sửa!");
      router.push("/admin/pages");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const item = await getPageById(id);
        if (item) {
          setForm({
            title: item.title || "",
            slug: item.slug || "",
            content: item.content || "",
            description: item.description || "",
            status: item.status ?? 1,
          });
        }
      } catch (err) {
        console.error("Lỗi tải thông tin trang:", err);
        alert("Không thể tải thông tin trang!");
        router.push("/admin/pages");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Vui lòng nhập tiêu đề trang");
    if (!form.content.trim()) return alert("Vui lòng nhập nội dung trang");

    setSubmitting(true);
    try {
      await updatePage(id, {
        title: form.title.trim(),
        slug: form.slug.trim(),
        content: form.content.trim(),
        description: form.description ? form.description.trim() : null,
        status: Number(form.status),
      });

      alert("✅ Cập nhật trang đơn thành công!");
      router.push("/admin/pages");
    } catch (err) {
      console.error("Lỗi cập nhật trang đơn:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi cập nhật trang đơn";
      alert("❌ " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-500" />
        Đang tải dữ liệu trang đơn...
      </div>
    );
  }

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
              Sửa Trang Đơn #{id}
            </h1>
            <p className="text-sm text-gray-500">Cập nhật nội dung, tiêu đề và đường dẫn</p>
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
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              <Save className="w-4 h-4" />
              {submitting ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditPagePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-500" />
        </div>
      }
    >
      <EditPageContent />
    </Suspense>
  );
}
