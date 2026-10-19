"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, getPostTopics } from "@/services/postServices";
import { FileText, ArrowLeft, Upload, X } from "lucide-react";

const generateSlug = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export default function CreatePostPage() {
  const router = useRouter();

  const [topics, setTopics] = useState([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    topic_id: "",
    summary: "",
    content: "",
    status: "1",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const list = await getPostTopics();
        setTopics(list);
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, topic_id: String(list[0].id) }));
        }
      } catch (err) {
        console.error("Lỗi lấy chủ đề bài viết:", err);
      }
    };
    void fetchTopics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "title") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (!form.content.trim()) {
      setError("Vui lòng nhập nội dung bài viết");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("slug", form.slug.trim());
      if (form.topic_id) formData.append("topic_id", form.topic_id);
      formData.append("summary", form.summary.trim());
      formData.append("content", form.content.trim());
      formData.append("status", form.status);

      if (image) {
        formData.append("image", image);
      }

      await createPost(formData);
      alert("✅ Thêm bài viết mới thành công!");
      router.push("/admin/posts");
    } catch (err) {
      console.error("Lỗi thêm bài viết:", err);
      const msg = err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi thêm bài viết";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/posts")}
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition shadow-2xs cursor-pointer"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#f68b1f]" />
                <span>Thêm bài viết mới</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Nhập nội dung chia sẻ, kiến thức cắm hoa và tải lên ảnh bài viết
              </p>
            </div>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tiêu đề */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700">
                Tiêu đề bài viết <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ví dụ: Bí quyết giữ hoa hồng tươi lâu trong 7 ngày..."
                required
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700">Đường dẫn Slug</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="Slug tự động tạo từ tiêu đề..."
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs font-mono text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Chủ đề */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700">Chủ đề bài viết</label>
              <select
                name="topic_id"
                value={form.topic_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs cursor-pointer"
              >
                {topics.length > 0 ? (
                  topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                ) : (
                  <option value="">Chủ đề chung</option>
                )}
              </select>
            </div>

            {/* Trạng thái */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700">Trạng thái hiển thị</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs cursor-pointer"
              >
                <option value="1">Hiển thị (Công khai)</option>
                <option value="0">Ẩn (Bản nháp)</option>
              </select>
            </div>

            {/* Ảnh đại diện */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700">Ảnh đại diện bài viết</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition cursor-pointer text-xs font-medium">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span>Chọn ảnh</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {preview && (
                  <div className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                    <img src={preview} alt="Xem trước" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 p-0.5 bg-rose-500 text-white rounded-bl hover:bg-rose-600"
                      title="Gỡ ảnh"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tóm tắt */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700">Đoạn tóm tắt ngắn (Summary)</label>
            <textarea
              name="summary"
              rows={2}
              value={form.summary}
              onChange={handleChange}
              placeholder="Đoạn văn ngắn tóm tắt nội dung chính để hiển thị ngoài danh sách tin tức..."
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs resize-y"
            />
          </div>

          {/* Nội dung chi tiết */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700">
              Nội dung bài viết <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="content"
              rows={8}
              value={form.content}
              onChange={handleChange}
              placeholder="Nhập toàn bộ nội dung chi tiết bài viết..."
              required
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs resize-y"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push("/admin/posts")}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg font-medium transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#f68b1f] hover:bg-[#e67300] text-white rounded-lg font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Đăng bài viết"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
