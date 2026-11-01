"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getTrashSuppliers,
  restoreSupplier,
  forceDeleteSupplier,
} from "@/services/supplierServices";
import {
  Truck,
  Trash2,
  RotateCcw,
  ArrowLeft,
  RefreshCw,
  Search,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function SuppliersTrashPage() {
  const [trashedSuppliers, setTrashedSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Tải danh sách nhà cung cấp trong thùng rác
  const fetchTrashList = async () => {
    setLoading(true);
    try {
      const res = await getTrashSuppliers({ per_page: 100 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setTrashedSuppliers(list);
    } catch (err) {
      console.error("Lỗi tải thùng rác nhà cung cấp:", err);
      setTrashedSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashList();
  }, []);

  // 2. Lọc danh sách theo từ khóa
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return trashedSuppliers;
    const term = searchTerm.toLowerCase();
    return trashedSuppliers.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.phone?.toLowerCase().includes(term) ||
        item.address?.toLowerCase().includes(term)
    );
  }, [trashedSuppliers, searchTerm]);

  // 3. Khôi phục nhà cung cấp
  const handleRestore = async (id) => {
    if (!window.confirm("Bạn có chắc muốn khôi phục nhà cung cấp này?")) return;

    try {
      await restoreSupplier(id);
      alert("✅ Đã khôi phục nhà cung cấp thành công!");
      setTrashedSuppliers((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi khôi phục:", error);
      alert("❌ Khôi phục thất bại, vui lòng thử lại!");
    }
  };

  // 4. Xóa vĩnh viễn nhà cung cấp khỏi database
  const handleForceDelete = async (id) => {
    if (
      !window.confirm(
        "⚠️ CẢNH BÁO: Nhà cung cấp này sẽ bị XÓA VĨNH VIỄN khỏi database và không thể lấy lại. Bạn có chắc không?"
      )
    ) {
      return;
    }

    try {
      await forceDeleteSupplier(id);
      alert("✅ Đã xóa vĩnh viễn nhà cung cấp!");
      setTrashedSuppliers((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi xóa vĩnh viễn:", error);
      alert("❌ Xóa vĩnh viễn thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang thùng rác */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/suppliers"
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              title="Quay lại danh sách nhà cung cấp"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-rose-500" />
                <span>Thùng rác Nhà cung cấp</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Danh sách các nhà cung cấp đã tạm xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTrashList}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs text-gray-600 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
            />
          </div>
          <div className="text-xs text-gray-500">
            Tổng cộng: <span className="font-semibold text-rose-600">{trashedSuppliers.length}</span> trong thùng rác
          </div>
        </div>

        {/* Bảng danh sách thùng rác */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[200px]">Tên nhà cung cấp</th>
                  <th className="py-3 px-4 min-w-[140px]">Số điện thoại</th>
                  <th className="py-3 px-4 min-w-[200px]">Địa chỉ</th>
                  <th className="py-3 px-4 min-w-[140px]">Thời gian xóa</th>
                  <th className="py-3 px-4 w-36 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#f68b1f]" />
                      <span>Đang tải danh sách thùng rác...</span>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <Trash2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Thùng rác nhà cung cấp đang trống.</p>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-rose-50/20 transition">
                      <td className="py-3 px-4 text-center font-medium text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-800 text-sm">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Mã NCC: #{item.id}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.phone ? (
                          <div className="inline-flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{item.phone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa có</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {item.address ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{item.address}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa có</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.deleted_at || "Vừa xong"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleRestore(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition font-medium cursor-pointer"
                            title="Khôi phục lại nhà cung cấp"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Khôi phục</span>
                          </button>
                          <button
                            onClick={() => handleForceDelete(item.id)}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-md transition cursor-pointer"
                            title="Xóa vĩnh viễn khỏi database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}
