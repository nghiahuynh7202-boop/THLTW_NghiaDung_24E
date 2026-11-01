"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getTrashPages,
  restorePage,
  forceDeletePage,
} from "@/services/pageServices";
import {
  FileText,
  Trash2,
  RotateCcw,
  ArrowLeft,
  RefreshCw,
  Search,
} from "lucide-react";

export default function TrashPagesPage() {
  const [trashedPages, setTrashedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Tải danh sách trang đơn trong thùng rác
  const fetchTrashList = async () => {
    setLoading(true);
    try {
      const res = await getTrashPages({ per_page: 50 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setTrashedPages(list);
    } catch (err) {
      console.error("Lỗi tải thùng rác trang đơn:", err);
      setTrashedPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashList();
  }, []);

  // 2. Lọc danh sách theo từ khóa tìm kiếm
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return trashedPages;
    const term = searchTerm.toLowerCase();
    return trashedPages.filter(
      (item) =>
        item.title?.toLowerCase().includes(term) ||
        item.slug?.toLowerCase().includes(term)
    );
  }, [trashedPages, searchTerm]);

  // 3. Khôi phục trang đơn
  const handleRestore = async (id) => {
    if (!window.confirm("Bạn có chắc muốn khôi phục trang đơn này?")) return;

    try {
      await restorePage(id);
      alert("✅ Đã khôi phục trang đơn thành công!");
      setTrashedPages((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi khôi phục:", error);
      alert("❌ Khôi phục thất bại, vui lòng thử lại!");
    }
  };

  // 4. Xóa vĩnh viễn trang đơn khỏi CSDL
  const handleForceDelete = async (id) => {
    if (
      !window.confirm(
        "⚠️ CẢNH BÁO: Trang đơn này sẽ bị xóa VĨNH VIỄN khỏi database và không thể lấy lại. Bạn có chắc không?"
      )
    )
      return;

    try {
      await forceDeletePage(id);
      alert("✅ Đã xóa vĩnh viễn trang đơn!");
      setTrashedPages((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi xóa vĩnh viễn:", error);
      alert("❌ Xóa vĩnh viễn thất bại!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
            title="Quay lại danh sách trang đơn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-rose-500" />
              Thùng Rác Trang Đơn (Trang Tĩnh)
            </h1>
            <p className="text-sm text-gray-500">
              Danh sách các trang tĩnh đã xóa tạm thời. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
            </p>
          </div>
        </div>

        <button
          onClick={fetchTrashList}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Tìm kiếm */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc slug trang..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Bảng danh sách thùng rác */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Tiêu đề</th>
                <th className="py-3.5 px-4">Đường dẫn (Slug)</th>
                <th className="py-3.5 px-4">Mô tả tóm tắt</th>
                <th className="py-3.5 px-4">Ngày xóa</th>
                <th className="py-3.5 px-4 text-center w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-500" />
                    Đang tải thùng rác...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Trash2 className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-1" />
                    Thùng rác trang đơn trống!
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-4 px-4 text-center text-gray-400 font-mono text-xs">
                      {index + 1}
                    </td>

                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {item.title}
                    </td>

                    <td className="py-4 px-4 font-mono text-xs text-teal-600 font-medium">
                      /{item.slug}
                    </td>

                    <td className="py-4 px-4 text-xs text-gray-600 max-w-xs truncate">
                      {item.description || item.content?.slice(0, 80) || "—"}
                    </td>

                    <td className="py-4 px-4 text-xs text-gray-400">
                      {item.deleted_at
                        ? new Date(item.deleted_at).toLocaleString("vi-VN")
                        : "—"}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Khôi phục trang"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleForceDelete(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
