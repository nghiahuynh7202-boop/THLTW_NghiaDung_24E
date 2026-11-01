"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getTopics,
  deleteTopic,
} from "@/services/topicServices";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Folder,
} from "lucide-react";

function PostTopicsContent() {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Tải danh sách chủ đề bài viết từ backend
  const fetchTopicsList = async () => {
    setLoading(true);
    try {
      const res = await getTopics({ per_page: 100 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setTopics(list);
    } catch (error) {
      console.error("Lỗi tải danh sách chủ đề:", error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicsList();
  }, []);

  // 2. Lọc danh sách chủ đề
  const filteredTopics = useMemo(() => {
    return topics.filter((item) => {
      if (statusFilter !== "all" && String(item.status) !== String(statusFilter)) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(term);
        const matchSlug = item.slug?.toLowerCase().includes(term);
        return matchName || matchSlug;
      }
      return true;
    });
  }, [topics, statusFilter, searchTerm]);

  // 3. Phân trang
  const pageCount = Math.ceil(filteredTopics.length / itemsPerPage) || 1;
  const currentTopics = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTopics.slice(start, start + itemsPerPage);
  }, [filteredTopics, currentPage]);

  // 4. Xóa chủ đề (vào thùng rác)
  const handleDeleteTopic = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn chuyển chủ đề này vào thùng rác?")) return;

    try {
      await deleteTopic(id);
      alert("✅ Đã chuyển chủ đề vào thùng rác!");
      setTopics((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Lỗi xóa chủ đề:", err);
      alert("❌ Xóa thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-[#f68b1f]" />
              <span>Quản lý Chủ đề bài viết</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý danh sách các chủ đề, danh mục bài viết tin tức
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push("/admin/post-topics/trash")}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Thùng rác</span>
            </button>

            <button
              onClick={() => router.push("/admin/post-topics/create")}
              className="inline-flex items-center gap-1.5 bg-[#f68b1f] hover:bg-[#e67300] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm chủ đề</span>
            </button>
          </div>
        </div>

        {/* Khung Card chính */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Thanh tiêu đề con & Bộ lọc */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách chủ đề</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {filteredTopics.length}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Tìm kiếm */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm theo tên hoặc slug..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] w-48 sm:w-60"
                />
              </div>

              {/* Lọc trạng thái */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1.5 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white text-gray-600"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Hiển thị</option>
                <option value="0">Tạm ẩn</option>
              </select>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16 text-center">STT</th>
                  <th className="py-3 px-4">Tên chủ đề</th>
                  <th className="py-3 px-4">Đường dẫn (Slug)</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-28">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải danh sách chủ đề...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentTopics.length > 0 ? (
                  currentTopics.map((item, index) => (
                    <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      {/* Tên */}
                      <td className="py-3.5 px-4 font-semibold text-gray-800 text-xs">
                        {item.name}
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded">
                          {item.slug || "-"}
                        </span>
                      </td>

                      {/* Mô tả */}
                      <td className="py-3.5 px-4 text-gray-500 text-xs max-w-xs truncate">
                        {item.description || "—"}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        {Number(item.status) === 1 ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Hiển thị
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Đã ẩn
                          </span>
                        )}
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => router.push(`/admin/post-topics/update?id=${item.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer"
                            title="Xóa chủ đề"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      <Folder className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-medium text-gray-500">Chưa có chủ đề nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="bg-gray-50/50 border-t border-gray-100 px-5 py-3 flex justify-center items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md text-xs font-medium cursor-pointer transition ${
                    currentPage === i + 1
                      ? "bg-[#f68b1f] text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === pageCount}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-white disabled:opacity-40 cursor-pointer"
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

export default function PostTopicsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-xs">Đang tải chủ đề...</div>}>
      <PostTopicsContent />
    </Suspense>
  );
}
