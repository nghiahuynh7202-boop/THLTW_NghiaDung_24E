/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories, deleteCategory, CategoryItem } from "@/services/categoryServices";

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refresh = searchParams.get("refresh");

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const itemsPerPage = 8;

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const res = await getCategories();

        // Xử lý dữ liệu trả về từ API backend Laravel
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

        if (isMounted) {
          console.log("Category loaded:", list.length);
          setCategories(list);
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  // Lọc theo từ khóa tìm kiếm và trạng thái
  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      const matchName = (item.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchSlug = (item.slug || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchSearch = matchName || matchSlug;

      if (statusFilter === "active") return matchSearch && Number(item.status) === 1;
      if (statusFilter === "hidden") return matchSearch && Number(item.status) === 0;
      if (statusFilter === "featured") return matchSearch && Boolean(item.is_featured);

      return matchSearch;
    });
  }, [categories, searchTerm, statusFilter]);

  const pageCount = Math.ceil(filteredCategories.length / itemsPerPage);

  const currentCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCategories.slice(start, end);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục hoa này?")) return;
    try {
      await deleteCategory(id);
      alert("✅ Xóa danh mục thành công!");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj?.response?.data?.message || errorObj?.message || "Xóa thất bại";
      alert("❌ " + msg);
    }
  };

  // Helper tìm tên danh mục cha
  const getParentName = (parentId: number | null) => {
    if (!parentId) return "—";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : `#${parentId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-indigo-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              🌸 Quản lý Danh mục Hoa
            </h1>
            <p className="text-gray-600 mt-1">
              Dựa trên cấu trúc bảng <code className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-sm font-semibold">categories</code> trong cơ sở dữ liệu
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => router.push("/admin/category?refresh=" + Date.now())}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 px-5 py-2.5 rounded-xl font-semibold transition duration-200 shadow-sm hover:shadow"
            >
              <span className={isLoading ? "animate-spin" : ""}>🔄</span>
              {isLoading ? "Đang tải..." : "Làm mới"}
            </button>

            <button
              onClick={() => router.push("/admin/category/trash")}
              className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-5 py-2.5 rounded-xl font-semibold transition duration-200 shadow-sm"
            >
              🗑️ Thùng rác
            </button>

            <button
              onClick={() => router.push("/admin/category/create")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl font-bold transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              ✚ Thêm danh mục
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="🔍 Tìm theo tên hoa hoặc slug..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Lọc:</span>
            {[
              { label: "Tất cả", value: "all" },
              { label: "Hiển thị", value: "active" },
              { label: "Đã ẩn", value: "hidden" },
              { label: "Nổi bật ⭐", value: "featured" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === tab.value
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Table Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Table Header Banner */}
          <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 px-8 py-5 flex items-center justify-between text-white">
            <div>
              <h2 className="text-xl font-bold">Danh sách Danh mục hoa</h2>
              <p className="text-rose-100 text-xs mt-0.5">
                Hiển thị {filteredCategories.length} / {categories.length} danh mục
              </p>
            </div>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
              Trang {currentPage} / {pageCount || 1}
            </span>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase font-bold text-gray-600 tracking-wider">
                  <th className="py-4 px-6 text-center w-16">STT</th>
                  <th className="py-4 px-6 w-20">Hình ảnh</th>
                  <th className="py-4 px-6">Tên danh mục</th>
                  <th className="py-4 px-6">Slug</th>
                  <th className="py-4 px-6">Danh mục cha</th>
                  <th className="py-4 px-6 text-center">Nổi bật</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-center w-28">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {currentCategories.length > 0 ? (
                  currentCategories.map((item, index) => {
                    const imageUrl = item.image
                      ? item.image.startsWith("http")
                        ? item.image
                        : `http://127.0.0.1:8000/storage/${item.image}`
                      : null;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors duration-150 ${
                          index % 2 === 0 ? "bg-white hover:bg-rose-50/40" : "bg-gray-50/40 hover:bg-rose-50/40"
                        }`}
                      >
                        {/* STT */}
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </span>
                        </td>

                        {/* Hình ảnh (image) */}
                        <td className="py-4 px-6">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shadow-xs">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-xl">🌺</span>
                            )}
                          </div>
                        </td>

                        {/* Tên danh mục (name) */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-400">ID: #{item.id}</div>
                        </td>

                        {/* Slug */}
                        <td className="py-4 px-6">
                          <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono border border-gray-200">
                            {item.slug || "—"}
                          </code>
                        </td>

                        {/* Danh mục cha (parent_id) */}
                        <td className="py-4 px-6 text-gray-600 font-medium">
                          {getParentName(item.parent_id)}
                        </td>

                        {/* Nổi bật (is_featured) */}
                        <td className="py-4 px-6 text-center">
                          {Boolean(item.is_featured) ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 shadow-xs">
                              ⭐ Nổi bật
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">—</span>
                          )}
                        </td>

                        {/* Trạng thái (status) */}
                        <td className="py-4 px-6 text-center">
                          {Number(item.status) === 1 ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              Hiển thị
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-gray-300">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              Đã ẩn
                            </span>
                          )}
                        </td>

                        {/* Hành động */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/category/update?id=${item.id}`)}
                              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition hover:scale-105 shadow-sm"
                              title="Sửa danh mục"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold transition hover:scale-105 shadow-sm"
                              title="Xóa danh mục"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <span className="text-5xl">💐</span>
                        <p className="text-lg font-bold text-gray-700">Không tìm thấy danh mục hoa nào</p>
                        <p className="text-xs text-gray-400">Hãy thử tìm từ khóa khác hoặc bấm nút &quot;Thêm danh mục&quot;</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pageCount > 1 && (
            <div className="bg-gray-50/80 border-t border-gray-200 px-8 py-5 flex justify-between items-center flex-wrap gap-3">
              <p className="text-xs text-gray-500 font-medium">
                Đang xem trang <strong className="text-gray-800">{currentPage}</strong> trên tổng số{" "}
                <strong className="text-gray-800">{pageCount}</strong> trang
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 text-xs font-bold border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-white bg-gray-50 transition"
                >
                  ← Trước
                </button>

                {[...Array(pageCount)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                      currentPage === i + 1
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                  className="px-3.5 py-2 text-xs font-bold border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-white bg-gray-50 transition"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải danh mục...</div>}>
      <CategoryContent />
    </Suspense>
  );
}
