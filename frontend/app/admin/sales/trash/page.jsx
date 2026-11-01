"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getTrashSales,
  restoreSale,
  forceDeleteSale,
} from "@/services/saleServices";
import {
  Tag,
  Trash2,
  RotateCcw,
  ArrowLeft,
  RefreshCw,
  Ticket,
} from "lucide-react";

export default function TrashSalesPage() {
  const [trashedSales, setTrashedSales] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Tải danh sách khuyến mãi trong thùng rác
  const fetchTrashList = async () => {
    setLoading(true);
    try {
      const res = await getTrashSales({ per_page: 50 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setTrashedSales(list);
    } catch (err) {
      console.error("Lỗi tải thùng rác khuyến mãi:", err);
      setTrashedSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashList();
  }, []);

  // 2. Khôi phục khuyến mãi
  const handleRestore = async (id) => {
    if (!window.confirm("Bạn có muốn khôi phục khuyến mãi này?")) return;

    try {
      await restoreSale(id);
      alert("✅ Đã khôi phục khuyến mãi thành công!");
      setTrashedSales((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi khôi phục:", error);
      alert("❌ Khôi phục khuyến mãi thất bại!");
    }
  };

  // 3. Xóa vĩnh viễn khuyến mãi
  const handleForceDelete = async (id) => {
    if (
      !window.confirm(
        "⚠️ CẢNH BÁO: Khuyến mãi này sẽ bị xóa VĨNH VIỄN khỏi database và không thể lấy lại. Bạn có chắc không?"
      )
    )
      return;

    try {
      await forceDeleteSale(id);
      alert("✅ Đã xóa vĩnh viễn khuyến mãi!");
      setTrashedSales((prev) => prev.filter((item) => item.id !== id));
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
            href="/admin/sales"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-rose-500" />
              Thùng Rác Khuyến Mãi
            </h1>
            <p className="text-sm text-gray-500">
              Danh sách các mã khuyến mãi đã xóa tạm thời
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

      {/* Bảng danh sách thùng rác */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-4 px-4 w-16 text-center">STT</th>
                <th className="py-4 px-4">Tên chương trình & Mã</th>
                <th className="py-4 px-4">Mức giảm</th>
                <th className="py-4 px-4 w-40">Thời gian xóa</th>
                <th className="py-4 px-4 w-44 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Đang tải danh sách thùng rác...
                  </td>
                </tr>
              ) : trashedSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Thùng rác trống. Chưa có khuyến mãi nào bị xóa.
                  </td>
                </tr>
              ) : (
                trashedSales.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="py-4 px-4 text-center text-gray-500 font-medium">
                      {index + 1}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      {item.code && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Ticket className="w-3 h-3" />
                          {item.code}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-semibold text-rose-600">
                      {item.discount_type === "percent"
                        ? `${item.discount_value}%`
                        : item.discount_type === "amount"
                        ? `${Number(item.discount_value || 0).toLocaleString("vi-VN")} đ`
                        : `${Number(item.pricesale || 0).toLocaleString("vi-VN")} đ`}
                    </td>

                    <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {item.deleted_at || "—"}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                          title="Khôi phục khuyến mãi"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Khôi phục
                        </button>
                        <button
                          onClick={() => handleForceDelete(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa vĩnh viễn
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
