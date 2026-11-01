"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTopicById, updateTopic } from "@/services/topicServices";
import { FolderTree, ArrowLeft, Save, RefreshCw } from "lucide-react";

function EditTopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: 1,
  });

  useEffect(() => {
    if (!id) {
      alert("Không tìm thấy chủ đề cần sửa!");
      router.push("/admin/post-topics");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const item = await getTopicById(id);
        if (item) {
          setForm({
            name: item.name || "",
            slug: item.slug || "",
            description: item.description || "",
            status: item.status ?? 1,
          });
        }
      } catch (err) {
        console.error("Lỗi tải thông tin chủ đề:", err);
        alert("Không thể tải thông tin chủ đề!");
        router.push("/admin/post-topics");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Vui lòng nhập tên chủ đề");

    setSubmitting(true);
    try {
      await updateTopic(id, {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description ? form.description.trim() : null,
        status: Number(form.status),
      });

      alert("✅ Cập nhật chủ đề thành công!");
      router.push("/admin/post-topics");
    } catch (err) {
      console.error("Lỗi cập nhật chủ đề:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi cập nhật chủ đề";
      alert("❌ " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
        Đang tải dữ liệu chủ đề...
      </div>
    );
  }

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
              Sửa Chủ Đề #{id}
            </h1>
            <p className="text-sm text-gray-500">Cập nhật tên, đường dẫn và mô tả chủ đề</p>
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
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <Save className="w-4 h-4" />
              {submitting ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditTopicPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f68b1f]" />
        </div>
      }
    >
      <EditTopicContent />
    </Suspense>
  );
}
