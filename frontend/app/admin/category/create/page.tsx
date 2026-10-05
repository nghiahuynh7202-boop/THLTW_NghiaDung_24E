"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  createCategory,
  getCategories,
  CategoryItem,
} from "@/services/categoryServices";
import {
  ArrowLeft,
  Upload,
  Plus,
  Home,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";

export default function CreateCategoryPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
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
    let isMounted = true;
    const loadParents = async () => {
      try {
        const res = await getCategories();
        let list: CategoryItem[] = [];
        const resData = res.data as Record<string, unknown>;

        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(resData?.data)) {
          list = resData.data as CategoryItem[];
        } else if (Array.isArray(resData?.category)) {
          list = resData.category as CategoryItem[];
        } else if (Array.isArray(resData?.categories)) {
          list = resData.categories as CategoryItem[];
        }

        if (isMounted) setCategories(list);
      } catch (err) {
        console.error("Lỗi lấy danh mục cha:", err);
      }
    };
    void loadParents();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: generatedSlug,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("⚠️ Vui lòng nhập tên danh mục!");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      if (formData.slug.trim()) data.append("slug", formData.slug.trim());
      if (formData.parent_id) data.append("parent_id", formData.parent_id);
      data.append("is_featured", formData.is_featured.toString());
      data.append("status", formData.status.toString());
      if (imageFile) {
        data.append("image", imageFile);
      }

      await createCategory(data);
      alert("✅ Thêm danh mục thành công!");
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
        "Thêm danh mục thất bại!";
      alert("❌ " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-300 gap-2">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Thêm danh mục
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
          <span className="text-gray-700 font-semibold">Thêm mới</span>
        </div>
      </div>

      {/* Form Card (Box phong cách AdminLTE viền xanh trên đầu) */}
      <div className="bg-white border border-gray-300 border-t-3 border-t-[#3c8dbc] shadow-2xs">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            Thông tin danh mục
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
                  placeholder="Nhập tên danh mục..."
                  value={formData.name}
                  onChange={handleNameChange}
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
                  placeholder="duong-dan-danh-muc"
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
                  <option value="">-- Chọn danh mục cha --</option>
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
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-semibold rounded-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn tệp ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa 2MB).
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
              className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#3c8dbc] hover:bg-[#367fa9] text-white font-bold rounded-xs text-xs shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang lưu..." : "Lưu danh mục"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
