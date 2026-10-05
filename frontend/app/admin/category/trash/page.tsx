"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getTrashCategories,
  restoreCategory,
  forceDeleteCategory,
  CategoryItem,
} from "@/services/categoryServices";
import {
  ArrowLeft,
  RotateCw,
  Trash2,
  Undo2,
  Home,
  ChevronRight,
  Layers,
} from "lucide-react";

export default function TrashCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pageCount: 1 });
  const pageSize = 10;

  const fetchTrashed = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await getTrashCategories(page, pageSize);
      const list = res?.data ?? [];
      const pg = res?.pagination ?? { total: 0, pageCount: 1 };
      setCategories(Array.isArray(list) ? list : []);
      setPagination(pg);
    } catch (err) {
      console.error("Lỗi lấy thùng rác danh mục:", err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await getTrashCategories(currentPage, pageSize);
        if (isMounted) {
          const list = res?.data ?? [];
          const pg = res?.pagination ?? { total: 0, pageCount: 1 };
          setCategories(Array.isArray(list) ? list : []);
          setPagination(pg);
        }
      } catch (err) {
        console.error("Lỗi lấy thùng rác danh mục:", err);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize]);

  const handleRestore = async (id: number) => {
    if (!window.confirm("Khôi phục danh mục này về danh sách hoạt động?")) return;
    try {
      await restoreCategory(id);
      alert("✅ Khôi phục thành công!");
      void fetchTrashed(currentPage);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert("❌ " + (errorObj?.message || "Khôi phục thất bại"));
    }
  };

  const handleForceDelete = async (id: number) => {
    if (!window.confirm("⚠️ Xóa vĩnh viễn? Dữ liệu và hình ảnh sẽ bị xóa hoàn toàn!")) return;
    try {
      await forceDeleteCategory(id);
      alert("✅ Đã xóa vĩnh viễn!");
      void fetchTrashed(currentPage);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert("❌ " + (errorObj?.message || "Xóa thất bại"));
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ Xóa TẤT CẢ danh mục trong thùng rác vĩnh viễn?")) return;
    try {
      await Promise.all(categories.map((c) => forceDeleteCategory(c.id)));
      alert("✅ Đã dọn sạch thùng rác!");
      setCurrentPage(1);
      void fetchTrashed(1);
    } catch {
      alert("❌ Có lỗi xảy ra khi xóa");
    }
  };

  const totalPages = pagination.pageCount ?? 1;

  return (
    <div className="space-y-4">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-300 gap-2">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Thùng rác danh mục
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
          <span className="text-red-600 font-semibold">Thùng rác</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchTrashed(currentPage)}
            disabled={isLoading}
            className="p-1.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-xs transition-colors"
            title="Làm mới"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <span className="text-xs text-gray-600">
            Tổng cộng: <strong>{pagination.total ?? 0}</strong> mục đã xóa tạm
          </span>
        </div>

        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1 bg-[#dd4b39] hover:bg-[#d73925] text-white px-3 py-1.5 rounded-xs text-xs font-bold shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Dọn sạch thùng rác</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => router.push("/admin/category")}
            className="inline-flex items-center gap-1 bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-3 py-1.5 rounded-xs text-xs font-semibold shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh mục</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#3c8dbc] text-white font-bold uppercase text-[11px] tracking-wider select-none">
              <tr>
                <th className="py-2.5 px-3 w-14 text-center border-r border-[#367fa9]">STT</th>
                <th className="py-2.5 px-3 w-20 text-center border-r border-[#367fa9]">HÌNH ẢNH</th>
                <th className="py-2.5 px-4 border-r border-[#367fa9]">DANH MỤC</th>
                <th className="py-2.5 px-3 border-r border-[#367fa9]">SLUG</th>
                <th className="py-2.5 px-3 border-r border-[#367fa9]">DANH MỤC CHA</th>
                <th className="py-2.5 px-3 text-center border-r border-[#367fa9]">TRẠNG THÁI</th>
                <th className="py-2.5 px-4 w-44 text-center">TÁC VỤ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-[#3c8dbc] rounded-full animate-spin" />
                      <span className="text-xs">Đang tải thùng rác...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Thùng rác trống. Không có danh mục nào bị xóa tạm.
                  </td>
                </tr>
              ) : (
                categories.map((item, index) => {
                  const imageUrl = item.image
                    ? item.image.startsWith("http")
                      ? item.image
                      : `http://127.0.0.1:8000/storage/${item.image}`
                    : null;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        <span className="inline-block px-2 py-0.5 border border-gray-300 bg-gray-50 text-gray-700 text-xs font-semibold rounded-xs">
                          {(currentPage - 1) * pageSize + index + 1}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        <div className="w-10 h-9 mx-auto border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center rounded-xs opacity-75">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.name || "ảnh"}
                              width={40}
                              height={36}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Layers className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                      </td>

                      <td className="py-2 px-4 border-r border-gray-200">
                        <span className="text-gray-600 line-through font-semibold">
                          {item.name || "Không có tên"}
                        </span>
                      </td>

                      <td className="py-2 px-3 border-r border-gray-200 text-gray-500 font-mono text-[11px]">
                        {item.slug || "-"}
                      </td>

                      <td className="py-2 px-3 border-r border-gray-200 text-gray-500">
                        {item.parent_id ? `#${item.parent_id}` : "Gốc"}
                      </td>

                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold rounded-xs">
                          Đã xóa tạm
                        </span>
                      </td>

                      <td className="py-2 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestore(item.id)}
                            className="inline-flex items-center gap-1 bg-[#00a65a] hover:bg-[#008d4c] text-white px-2.5 py-1 rounded-xs text-[11px] font-bold shadow-2xs transition-colors"
                          >
                            <Undo2 className="w-3 h-3" />
                            <span>Khôi phục</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleForceDelete(item.id)}
                            className="inline-flex items-center gap-1 bg-[#dd4b39] hover:bg-[#d73925] text-white px-2.5 py-1 rounded-xs text-[11px] font-bold shadow-2xs transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa vĩnh viễn</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
            <span>
              Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> ({pagination.total ?? 0} mục)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 rounded-xs text-xs font-medium"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 border text-xs font-bold rounded-xs transition-colors ${
                    currentPage === i + 1
                      ? "bg-[#3c8dbc] text-white border-[#3c8dbc]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 rounded-xs text-xs font-medium"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
