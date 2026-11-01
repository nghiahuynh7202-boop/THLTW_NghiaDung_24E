"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getSales,
  deleteSale,
} from "@/services/saleServices";
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  Ticket,
} from "lucide-react";

function SalesContent() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Tải danh sách khuyến mãi từ backend
  const fetchSalesList = async () => {
    setLoading(true);
    try {
      const res = await getSales({ per_page: 100 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setSales(list);
    } catch (error) {
      console.error("Lỗi tải danh sách khuyến mãi:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesList();
  }, []);

  // 2. Lọc danh sách theo từ khóa và trạng thái
  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      if (statusFilter !== "all" && String(item.status) !== String(statusFilter)) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(term);
        const matchCode = item.code?.toLowerCase().includes(term);
        return matchName || matchCode;
      }
      return true;
    });
  }, [sales, statusFilter, searchTerm]);

  // 3. Phân trang
  const pageCount = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const currentSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  // 4. Xóa khuyến mãi
  const handleDeleteSale = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn chuyển khuyến mãi này vào thùng rác?")) return;

    try {
      await deleteSale(id);
      alert("✅ Đã chuyển khuyến mãi vào thùng rác!");
      setSales((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Lỗi xóa khuyến mãi:", err);
      alert("❌ Xóa thất bại, vui lòng thử lại!");
    }
  };

  // Kiểm tra thời hạn khuyến mãi
  const isExpired = (endDateStr) => {
    if (!endDateStr) return false;
    return new Date(endDateStr) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Tag className="w-6 h-6 text-[#f68b1f]" />
              <span>Quản lý Khuyến mãi</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý các chương trình sale, mã giảm giá coupon và điều kiện áp dụng
            </p>
          </div>

          {/* Các nút hành động trên Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push("/admin/sales/trash")}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Thùng rác</span>
            </button>

            <button
              onClick={() => router.push("/admin/sales/create")}
              className="inline-flex items-center gap-1.5 bg-[#f68b1f] hover:bg-[#e67300] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo mã khuyến mãi</span>
            </button>
          </div>
        </div>

        {/* Khung Card chính */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Thanh tiêu đề con & Bộ lọc */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách khuyến mãi</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {filteredSales.length}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Ô tìm kiếm */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm theo tên, mã coupon..."
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
                <option value="1">Đang kích hoạt</option>
                <option value="0">Tạm tắt</option>
              </select>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-14 text-center">STT</th>
                  <th className="py-3 px-4">Tên chương trình & Mã</th>
                  <th className="py-3 px-4">Mức giảm giá</th>
                  <th className="py-3 px-4">Điều kiện</th>
                  <th className="py-3 px-4">Hiệu lực</th>
                  <th className="py-3 px-4 text-center">Đã dùng</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-28">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải danh sách khuyến mãi...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentSales.length > 0 ? (
                  currentSales.map((item, index) => {
                    const expired = isExpired(item.date_end);
                    return (
                      <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                        {/* STT */}
                        <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        {/* Tên & Mã */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-gray-800 text-xs block">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            {item.code ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-600 bg-gray-100/80 px-2 py-0.5 rounded font-bold">
                                <Ticket className="w-3 h-3 text-[#f68b1f]" />
                                {item.code}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">Không có mã code</span>
                            )}
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {item.apply_to === "order" ? "Đơn hàng" : "Sản phẩm"}
                            </span>
                          </div>
                        </td>

                        {/* Mức giảm */}
                        <td className="py-3.5 px-4 font-semibold text-gray-800">
                          {item.discount_type === "percent" ? (
                            <span className="text-rose-600 font-bold">
                              {item.discount_value}% <span className="text-[11px] font-normal text-gray-500">giảm</span>
                            </span>
                          ) : item.discount_type === "amount" ? (
                            <span className="text-rose-600 font-bold">
                              {Number(item.discount_value || 0).toLocaleString("vi-VN")} đ
                            </span>
                          ) : item.pricesale ? (
                            <span className="text-rose-600 font-bold">
                              {Number(item.pricesale).toLocaleString("vi-VN")} đ
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                          {item.max_discount > 0 && (
                            <div className="text-[10px] text-gray-400 font-normal">
                              Tối đa: {Number(item.max_discount).toLocaleString("vi-VN")} đ
                            </div>
                          )}
                        </td>

                        {/* Điều kiện */}
                        <td className="py-3.5 px-4 text-gray-600">
                          {item.min_order > 0 ? (
                            <span>Đơn từ {Number(item.min_order).toLocaleString("vi-VN")} đ</span>
                          ) : (
                            <span className="text-gray-400">Không yêu cầu</span>
                          )}
                        </td>

                        {/* Hiệu lực */}
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{item.date_begin ? item.date_begin.slice(0, 10) : "—"}</span>
                            <span>→</span>
                            <span className={expired ? "text-rose-600 font-semibold" : ""}>
                              {item.date_end ? item.date_end.slice(0, 10) : "—"}
                            </span>
                          </div>
                        </td>

                        {/* Đã dùng */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-semibold text-gray-800">{item.used_count || 0}</span>
                          <span className="text-gray-400"> / </span>
                          <span className="text-gray-500">{item.usage_limit || "∞"}</span>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-4 text-center">
                          {Number(item.status) === 0 ? (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Tạm tắt
                            </span>
                          ) : expired ? (
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Hết hạn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Hiển thị
                            </span>
                          )}
                        </td>

                        {/* Hành động */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => router.push(`/admin/sales/update?id=${item.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSale(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer"
                              title="Xóa khuyến mãi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      <Tag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-medium text-gray-500">Chưa có khuyến mãi nào</p>
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

export default function SalesManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-xs">Đang tải khuyến mãi...</div>}>
      <SalesContent />
    </Suspense>
  );
}
