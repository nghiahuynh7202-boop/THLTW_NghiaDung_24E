"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories, deleteCategory } from "@/services/categoryServices";
import { RefreshCw, Trash2, Plus, Edit2, Folder, Layers } from "lucide-react";
function CategoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const refresh = searchParams.get("refresh");
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 5;
    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = (await getCategories());
            let list = [];
            if (Array.isArray(res)) {
                list = res;
            }
            else if (Array.isArray(res?.data)) {
                list = res.data;
            }
            else if (Array.isArray(res?.data?.data)) {
                list = res.data.data;
            }
            else if (Array.isArray(res?.categories)) {
                list = res.categories;
            }
            setCategories(list);
        }
        catch (error) {
            console.error("Lỗi lấy danh mục:", error);
            setCategories([]);
        }
        finally {
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
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?"))
            return;
        try {
            await deleteCategory(id);
            alert("✅ Xóa danh mục thành công!");
            setCategories((prev) => prev.filter((c) => String(c.id) !== String(id)));
        }
        catch (err) {
            const errorObj = err;
            const msg = errorObj?.response?.data?.message || errorObj?.message || "Xóa thất bại";
            alert("❌ " + msg);
        }
    };
    return (<div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Tiêu đề trang nhẹ nhàng, tinh gọn */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#f68b1f]"/>
              <span>Quản lý Danh mục</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý danh sách các danh mục hoa tươi và quà tặng
            </p>
          </div>

          {/* Các nút hành động trên Header */}
          <div className="flex items-center gap-2 flex-wrap">


            <button onClick={() => router.push("/admin/category/trash")} className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer">
              <Trash2 className="w-3.5 h-3.5"/>
              <span>Thùng rác</span>
            </button>

            <button onClick={() => router.push("/admin/category/create")} className="inline-flex items-center gap-1.5 bg-[#f68b1f] hover:bg-[#e67300] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer">
              <Plus className="w-4 h-4"/>
              <span>Thêm danh mục</span>
            </button>
          </div>
        </div>

        {/* Khung Card chính: Bo góc nhẹ, viền xám hài hòa, không đậm màu */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Thanh tiêu đề con */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách danh mục</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {categories.length}
              </span>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16 text-center">STT</th>
                  <th className="py-3 px-4">Tên danh mục</th>
                  <th className="py-3 px-4">Đường dẫn (Slug)</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-28">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (<tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin"/>
                        <span>Đang tải danh mục...</span>
                      </div>
                    </td>
                  </tr>) : currentCategories.length > 0 ? (currentCategories.map((item, index) => (<tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      {/* Tên */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800 text-xs">
                          {item.name || "Không có tên"}
                        </span>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded">
                          {item.slug || "-"}
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        {Number(item.status) === 1 ? (<span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                            Hiển thị
                          </span>) : (<span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"/>
                            Đã ẩn
                          </span>)}
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button onClick={() => router.push(`/admin/category/update?id=${item.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition cursor-pointer" title="Chỉnh sửa">
                            <Edit2 className="w-3.5 h-3.5"/>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer" title="Xóa danh mục">
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      </td>
                    </tr>))) : (<tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      <Folder className="w-10 h-10 mx-auto text-gray-300 mb-2"/>
                      <p className="text-xs font-medium text-gray-500">Chưa có danh mục nào</p>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (<div className="bg-gray-50/50 border-t border-gray-100 px-5 py-3 flex justify-center items-center gap-1.5">
              <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-white disabled:opacity-40 cursor-pointer">
                Trước
              </button>
              {Array.from({ length: pageCount }).map((_, i) => (<button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-md text-xs font-medium cursor-pointer transition ${currentPage === i + 1
                    ? "bg-[#f68b1f] text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                  {i + 1}
                </button>))}
              <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === pageCount} className="px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-white disabled:opacity-40 cursor-pointer">
                Sau
              </button>
            </div>)}
        </div>
      </div>
    </div>);
}
export default function AdminCategoriesPage() {
    return (<Suspense fallback={<div className="p-8 text-center text-gray-500 text-xs">Đang tải danh mục...</div>}>
      <CategoryContent />
    </Suspense>);
}
