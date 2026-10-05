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

  const itemsPerPage = 10;

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = (await getCategories()) as any;

      // res từ axios unwrap = data server trả về
      let list: CategoryItem[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res?.categories)) {
        list = res.categories;
      }

      console.log("Categories loaded:", list.length);
      setCategories(list);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, [refresh]);

  const pageCount = Math.ceil(categories.length / itemsPerPage);

  const currentCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return categories.slice(start, end);
  }, [categories, currentPage]);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;
    try {
      await deleteCategory(id);
      alert("✅ Xóa danh mục thành công!");
      setCategories((prev) => prev.filter((c) => String(c.id) !== String(id)));
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj?.response?.data?.message || errorObj?.message || "Xóa thất bại";
      alert("❌ " + msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🗂️ Quản lý Danh mục</h1>
          <p className="text-gray-600">Quản lý toàn bộ danh mục trong hệ thống</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Danh sách danh mục</h2>
                <p className="text-blue-100 mt-1">Tổng số: {categories.length} danh mục</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/admin/category?refresh=" + Date.now())}
                  disabled={isLoading}
                  className="bg-blue-400 text-white hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                >
                  {isLoading ? "⟳ Đang tải..." : "⟳ Làm mới"}
                </button>
                <button
                  onClick={() => router.push("/admin/category/trash")}
                  className="bg-red-500 text-white hover:bg-red-600 px-6 py-3 rounded-xl font-bold transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                >
                  🗑 Thùng rác
                </button>
                <button
                  onClick={() => router.push("/admin/category/create")}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                >
                  ✚ Thêm danh mục
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">STT</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Tên danh mục</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Slug</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Trạng thái</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.length > 0 ? (
                  currentCategories.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b transition duration-200 ${index % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"
                        }`}
                    >
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </span>
                      </td>

                      <td className="py-5 px-6">
                        <div className="font-semibold text-gray-900">
                          {item.name || "Không có tên"}
                        </div>
                      </td>

                      <td className="py-5 px-6">
                        <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">
                          {item.slug || "-"}
                        </code>
                      </td>

                      <td className="py-5 px-6">
                        {Number(item.status) === 1 ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Hiển thị
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-gray-300">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Đã ẩn
                          </span>
                        )}
                      </td>

                      <td className="py-5 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/admin/category/update?id=${item.id}`)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-sm cursor-pointer"
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-sm cursor-pointer"
                            title="Xóa"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">
                      <p className="text-lg font-semibold">📭 Không có danh mục nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="bg-gray-50 border-t px-8 py-6 flex justify-center items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg border font-bold cursor-pointer ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-100"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === pageCount}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
              >
                Sau
              </button>
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
