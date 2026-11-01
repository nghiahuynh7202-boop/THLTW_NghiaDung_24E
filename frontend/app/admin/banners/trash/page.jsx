"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getTrashBanners,
  restoreBanner,
  forceDeleteBanner,
} from "@/services/bannerServices";
import {
  ImageIcon,
  Trash2,
  RotateCcw,
  ArrowLeft,
  RefreshCw,
  Search,
} from "lucide-react";

// Xử lý link ảnh từ backend Laravel
const resolveImgUrl = (rawImg) => {
  const raw = rawImg ? String(rawImg).trim() : "";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:")) {
    return raw;
  }
  const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
  const clean = raw.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `http://${hostname}:8000/storage/${clean}`;
};

export default function TrashBannersPage() {
  const [trashedBanners, setTrashedBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Tải danh sách banner trong thùng rác
  const fetchTrashList = async () => {
    setLoading(true);
    try {
      const res = await getTrashBanners({ per_page: 50 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setTrashedBanners(list);
    } catch (err) {
      console.error("Lỗi tải thùng rác banner:", err);
      setTrashedBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashList();
  }, []);

  // 2. Lọc danh sách banner theo link
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return trashedBanners;
    const term = searchTerm.toLowerCase();
    return trashedBanners.filter((item) =>
      item.link?.toLowerCase().includes(term)
    );
  }, [trashedBanners, searchTerm]);

  // 3. Khôi phục banner
  const handleRestore = async (id) => {
    if (!window.confirm("Bạn có chắc muốn khôi phục banner này?")) return;

    try {
      await restoreBanner(id);
      alert("✅ Đã khôi phục banner thành công!");
      setTrashedBanners((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi khôi phục:", error);
      alert("❌ Khôi phục banner thất bại!");
    }
  };

  // 4. Xóa vĩnh viễn banner khỏi CSDL và ổ đĩa
  const handleForceDelete = async (id) => {
    if (
      !window.confirm(
        "⚠️ CẢNH BÁO: Banner này sẽ bị xóa VĨNH VIỄN khỏi database và không thể lấy lại. Bạn có chắc không?"
      )
    )
      return;

    try {
      await forceDeleteBanner(id);
      alert("✅ Đã xóa vĩnh viễn banner!");
      setTrashedBanners((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi xóa vĩnh viễn:", error);
      alert("❌ Xóa vĩnh viễn banner thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/banners"
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
              title="Quay lại danh sách banner"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-rose-500" />
                <span>Thùng Rác Banner</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Danh sách các banner đã xóa tạm thời. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
              </p>
            </div>
          </div>

          <button
            onClick={fetchTrashList}
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#f68b1f]" : ""}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Khung Card chính */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Thanh tiêu đề con & Tìm kiếm */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách banner đã xóa</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {filteredList.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo đường dẫn liên kết..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] w-56"
              />
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16 text-center">STT</th>
                  <th className="py-3 px-4 w-48">Hình ảnh</th>
                  <th className="py-3 px-4">Đường dẫn liên kết</th>
                  <th className="py-3 px-4 text-center w-24">Thứ tự</th>
                  <th className="py-3 px-4">Ngày xóa</th>
                  <th className="py-3 px-4 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải thùng rác...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                        {index + 1}
                      </td>

                      {/* Hình ảnh */}
                      <td className="py-3.5 px-4">
                        <div className="w-36 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={resolveImgUrl(item.image)}
                              alt="Banner"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                      </td>

                      {/* Link */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded">
                          {item.link || "/"}
                        </span>
                      </td>

                      {/* Thứ tự */}
                      <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                        {item.order_num ?? 0}
                      </td>

                      {/* Ngày xóa */}
                      <td className="py-3.5 px-4 text-gray-400 text-xs">
                        {item.deleted_at
                          ? new Date(item.deleted_at).toLocaleString("vi-VN")
                          : "—"}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleRestore(item.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-md transition cursor-pointer"
                            title="Khôi phục banner"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleForceDelete(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer"
                            title="Xóa vĩnh viễn"
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
                      <Trash2 className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-medium text-gray-500">Thùng rác banner trống</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
