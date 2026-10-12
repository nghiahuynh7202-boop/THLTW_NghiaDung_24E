"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrandById, updateBrand } from "@/services/brandServices";
import { Award, ArrowLeft, Upload, X } from "lucide-react";

const generateSlug = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");

function EditBrandContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: "1",
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Fetch brand data
  useEffect(() => {
    if (!id) {
      setFetching(false);
      return;
    }

    const fetchBrand = async () => {
      try {
        setFetching(true);
        const b = await getBrandById(id);
        if (!b || !b.id) {
          setError("Không tìm thấy thương hiệu tương ứng");
          return;
        }

        setForm({
          name: b.name || "",
          slug: b.slug || "",
          description: b.description || "",
          status: String(b.status ?? "1"),
        });

        if (b.image) {
          const imgUrl = String(b.image).startsWith("http")
            ? b.image
            : `${backendUrl}/storage/${String(b.image).replace(/^\/?storage\//, "")}`;
          setPreview(imgUrl);
        }
      } catch (err) {
        console.error("Lỗi lấy thương hiệu:", err);
        setError("Không thể tải thông tin thương hiệu");
      } finally {
        setFetching(false);
      }
    };

    void fetchBrand();
  }, [id, backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên thương hiệu");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("slug", form.slug.trim());
      formData.append("description", form.description.trim());
      formData.append("status", form.status);

      if (image) {
        formData.append("image", image);
      }

      await updateBrand(id, formData);
      alert("✅ Cập nhật thương hiệu thành công!");
      router.push("/admin/brands");
    } catch (err) {
      console.error("Lỗi cập nhật thương hiệu:", err);
      const msg = err?.response?.data?.message || err?.message || "Cập nhật thương hiệu thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50/60 p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
          <span>Đang tải thông tin thương hiệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/brands")}
              className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition shadow-2xs cursor-pointer"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-6 h-6 text-[#f68b1f]" />
                <span>Chỉnh sửa thương hiệu #{id}</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Cập nhật thông tin chi tiết và logo thương hiệu
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
            {/* Tên thương hiệu */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700">
                Tên thương hiệu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên thương hiệu..."
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
                placeholder="Slug thương hiệu..."
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs font-mono text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Trạng thái */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700">Trạng thái hiển thị</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs cursor-pointer"
              >
                <option value="1">Hiển thị (Hoạt động)</option>
                <option value="0">Ẩn (Tạm khóa)</option>
              </select>
            </div>

            {/* Upload Logo */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700">Logo thương hiệu</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition cursor-pointer text-xs font-medium">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span>Chọn ảnh mới</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {preview && (
                  <div className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                    <img src={preview} alt="Xem trước" className="w-full h-full object-contain p-1" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700">Mô tả giới thiệu thương hiệu</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Giới thiệu đôi nét về thương hiệu..."
              className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] focus:bg-white transition text-xs resize-y"
            />
          </div>

          {/* Nút submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push("/admin/brands")}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg font-medium transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#f68b1f] hover:bg-[#e67300] text-white rounded-lg font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Cập nhật thương hiệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditBrandPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-xs">Đang tải thương hiệu...</div>}>
      <EditBrandContent />
    </Suspense>
  );
}
