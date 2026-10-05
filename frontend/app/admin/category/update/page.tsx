"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getCategory,
  updateCategory,
  getCategories,
  CategoryItem,
} from "@/services/categoryServices";
import {
  ArrowLeft,
  Upload,
  Check,
  Home,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";

function UpdateCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent_id: "",
    is_featured: 0,
    status: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!categoryId) {
      alert("⚠️ Thiếu ID danh mục cần sửa!");
      router.push("/admin/category");
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const catRes = await getCategory(categoryId);
        const catData = catRes.data;

        const listRes = await getCategories();
        let list: CategoryItem[] = [];
        const resData = listRes.data as Record<string, unknown>;

        if (Array.isArray(listRes.data)) {
          list = listRes.data;
        } else if (Array.isArray(resData?.data)) {
          list = resData.data as CategoryItem[];
        } else if (Array.isArray(resData?.category)) {
          list = resData.category as CategoryItem[];
        } else if (Array.isArray(resData?.categories)) {
          list = resData.categories as CategoryItem[];
        }

        if (isMounted && catData) {
          setFormData({
            name: catData.name || "",
            slug: catData.slug || "",
            parent_id: catData.parent_id ? String(catData.parent_id) : "",
            is_featured: catData.is_featured ? 1 : 0,
            status: catData.status !== undefined ? Number(catData.status) : 1,
          });

          if (catData.image) {
            const fullImg = catData.image.startsWith("http")
              ? catData.image
              : `http://127.0.0.1:8000/storage/${catData.image}`;
            setImagePreview(fullImg);
          }

          setCategories(list.filter((c) => String(c.id) !== String(categoryId)));
        }
      } catch (err: unknown) {
        console.error("Lỗi lấy dữ liệu:", err);
        alert("❌ Không thể tải thông tin danh mục!");
        router.push("/admin/category");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [categoryId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) return;
    if (!formData.name.trim()) {
      alert("⚠️ Vui lòng nhập tên danh mục!");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      if (formData.slug.trim()) data.append("slug", formData.slug.trim());
      if (formData.parent_id) {
        data.append("parent_id", formData.parent_id);
      } else {
        data.append("parent_id", "");
      }
      data.append("is_featured", formData.is_featured.toString());
      data.append("status", formData.status.toString());

      if (imageFile) {
        data.append("image", imageFile);
      }

      await updateCategory(categoryId, data);
      alert("✅ Cập nhật danh mục thành công!");
      router.push("/admin/category");
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
        message?: string;
      };
      const errorMsg =
        errorObj?.response?.data?.message ||
        (errorObj?.response?.data?.errors
          ? Object.values(errorObj.response.data.errors).flat().join("\n")
          : null) ||
        errorObj?.message ||
        "Cập nhật thất bại!";
      alert("❌ " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#3c8dbc] rounded-full animate-spin" />
        <span className="text-xs text-gray-500">Đang tải thông tin danh mục #{categoryId}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-300 gap-2">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Cập nhật danh mục #{categoryId}
        </h1>

        <div className="flex items-center text-xs text-gray-500 gap-1.5">
          <Link href="/admin" className="flex items-center gap-1 hover:text-[#3c8dbc]">
            <Home className="w-3.5 h-3.5 text-gray-600" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Link href="/admin/category" className="hover:text-[#3c8dbc]">
            Danh mục
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-700 font-semibold">Chỉnh sửa #{categoryId}</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-300 border-t-3 border-t-[#f39c12] shadow-2xs">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Thông tin chi tiết
          </h3>
          <Link
            href="/admin/category"
            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-gray-700 block">
                  Tên danh mục <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-300 focus:border-[#3c8dbc] outline-none text-xs text-gray-900 rounded-xs"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  Đường dẫn (Slug)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 focus:border-[#3c8dbc] outline-none text-xs text-gray-900 font-mono rounded-xs"
                />
              </div>

              {/* Cha */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block">
                  Danh mục cha
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, parent_id: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 focus:border-[#3c8dbc] outline-none text-xs text-gray-900 rounded-xs"
                >
                  <option value="">-- Là danh mục gốc (Không có cha) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (ID: #{c.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hình ảnh */}
            <div className="space-y-1.5 pt-2">
              <label className="font-bold text-gray-700 block">
                Hình ảnh đại diện
              </label>
              <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200">
                {imagePreview ? (
                  <div className="relative w-20 h-20 border border-gray-300 bg-white overflow-hidden rounded-xs shrink-0">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-white shrink-0">
                    <Layers className="w-5 h-5" />
                    <span className="text-[10px] mt-1">Chưa có ảnh</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f39c12] hover:bg-[#e08e0b] text-white font-semibold rounded-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Đổi ảnh mới</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Để trống nếu giữ nguyên ảnh hiện tại.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkbox Nổi bật & Trạng thái */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_featured === 1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_featured: e.target.checked ? 1 : 0,
                    }))
                  }
                  className="w-4 h-4 cursor-pointer accent-[#3c8dbc]"
                />
                <span>Hiển thị trang chủ (Nổi bật)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.status === 1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.checked ? 1 : 0,
                    }))
                  }
                  className="w-4 h-4 cursor-pointer accent-[#3c8dbc]"
                />
                <span>Kích hoạt hiển thị</span>
              </label>
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
            <Link
              href="/admin/category"
              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xs text-xs"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#f39c12] hover:bg-[#e08e0b] text-white font-bold rounded-xs text-xs shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang lưu..." : "Cập nhật thay đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UpdateCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#3c8dbc] rounded-full animate-spin" />
        </div>
      }
    >
      <UpdateCategoryContent />
    </Suspense>
  );
}
