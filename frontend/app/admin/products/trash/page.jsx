"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosAdmin from "@/lib/axiosAdmin";
import { Trash2, RotateCcw, ArrowLeft, Package, Image as ImageIcon } from "lucide-react";

const ADMIN = "/admin/products";
const TRASH_URL = `${ADMIN}/trash`;
const restoreUrl = (id) => `${ADMIN}/${id}/restore`;
const forceUrl = (id) => `${ADMIN}/${id}/force`;
const PAGE_SIZE = 10;

export default function TrashProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pageCount: 1 });

  const fetchTrashed = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await axiosAdmin.get(TRASH_URL, {
        params: { page, per_page: PAGE_SIZE },
      });
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      }

      const meta = res?.meta ?? res?.pagination ?? {};
      const total = meta?.total ?? list.length;
      const pageCount = meta?.last_page ?? meta?.pageCount ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

      setProducts(list);
      setPagination({
        total: Number(total) || 0,
        pageCount: Math.max(1, Number(pageCount) || 1),
      });
    } catch (err) {
      console.error("Lỗi lấy thùng rác sản phẩm:", err);
      setProducts([]);
      setPagination({ total: 0, pageCount: 1 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTrashed(currentPage);
  }, [currentPage, fetchTrashed]);

  const reloadAfterChange = () => {
    if (products.length === 1 && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    } else {
      void fetchTrashed(currentPage);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Khôi phục sản phẩm này?")) return;
    try {
      await axiosAdmin.patch(restoreUrl(id));
      alert("✅ Khôi phục thành công!");
      reloadAfterChange();
    } catch (err) {
      alert("❌ " + (err?.response?.data?.message || err?.message || "Khôi phục thất bại"));
    }
  };

  const handleForceDelete = async (id) => {
    if (!window.confirm("⚠️ Xóa vĩnh viễn? Không thể hoàn tác!")) return;
    try {
      await axiosAdmin.delete(forceUrl(id));
      alert("✅ Đã xóa vĩnh viễn!");
      reloadAfterChange();
    } catch (err) {
      alert("❌ " + (err?.response?.data?.message || err?.message || "Xóa thất bại"));
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`⚠️ Xóa vĩnh viễn ${products.length} sản phẩm trên trang này? Không thể hoàn tác!`))
      return;
    try {
      const results = await Promise.allSettled(products.map((p) => axiosAdmin.delete(forceUrl(p.id))));
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed === 0) {
        alert("✅ Đã xóa tất cả!");
      } else {
        alert(`⚠️ Đã xóa với ${failed} mục thất bại`);
      }
      setCurrentPage(1);
      void fetchTrashed(1);
    } catch (err) {
      console.error("Lỗi xóa tất cả:", err);
      alert("❌ Có lỗi xảy ra khi xóa");
    }
  };

  const getImageSrc = (item) => {
    const image = item.image ? String(item.image).trim() : "";
    if (!image) return null;
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("blob:")) {
      return image;
    }
    const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
    const cleanPath = image.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://${hostname}:8000/storage/${cleanPath}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const totalPages = pagination.pageCount ?? 1;

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <button
                onClick={() => router.push("/admin/products")}
                className="hover:text-blue-600 transition font-medium cursor-pointer"
              >
                Quản lý sản phẩm
              </button>
              <span>/</span>
              <span className="text-rose-600 font-semibold">Thùng rác</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-rose-500" />
              <span>Thùng rác sản phẩm</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Danh sách sản phẩm đã xóa tạm — có thể khôi phục lại hoặc xóa vĩnh viễn
            </p>
          </div>

          {/* Các nút hành động */}
          <div className="flex items-center gap-2 flex-wrap">
            {products.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết trang này</span>
              </button>
            )}

            <button
              onClick={() => router.push("/admin/products")}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        {/* Khung Card chính */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Thanh tiêu đề con */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách đã xóa</span>
              <span className="text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
                {pagination.total ?? 0} sản phẩm
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-14 text-center">STT</th>
                  <th className="py-3 px-4 w-16 text-center">Ảnh</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">Giá bán</th>
                  <th className="py-3 px-4 text-center">Ngày xóa</th>
                  <th className="py-3 px-4 text-center w-36">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-600 text-sm">Thùng rác trống</p>
                      <p className="text-gray-400 text-xs mt-0.5">Không có sản phẩm nào bị xóa tạm</p>
                    </td>
                  </tr>
                ) : (
                  products.map((item, index) => {
                    const imgSrc = getImageSrc(item);
                    const name = item.name || item.product_name || "Không có tên";
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-center text-gray-500 font-medium">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0 mx-auto flex items-center justify-center">
                            {imgSrc ? (
                              <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-700">{name}</div>
                          <span className="text-[10px] font-mono text-gray-400">{item.slug || "-"}</span>
                        </td>

                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {item.price ? Number(item.price).toLocaleString("vi-VN") + " đ" : "-"}
                        </td>

                        <td className="py-3 px-4 text-center text-gray-500 text-[11px]">
                          {formatDate(item.deleted_at)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleRestore(item.id)}
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                              title="Khôi phục sản phẩm"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Khôi phục</span>
                            </button>
                            <button
                              onClick={() => handleForceDelete(item.id)}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa VV</span>
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
            <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Trang {currentPage} / {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 cursor-pointer font-medium"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 cursor-pointer font-medium"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
