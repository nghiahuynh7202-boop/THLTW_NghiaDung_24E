"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getTrashContacts,
  restoreContact,
  forceDeleteContact,
} from "@/services/contactServices";
import {
  Trash2,
  RotateCcw,
  ArrowLeft,
  RefreshCw,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";

export default function TrashContactsPage() {
  const [trashedContacts, setTrashedContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Tải danh sách liên hệ trong thùng rác
  const fetchTrashList = async () => {
    setLoading(true);
    try {
      const res = await getTrashContacts({ per_page: 50 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setTrashedContacts(list);
    } catch (err) {
      console.error("Lỗi tải thùng rác liên hệ:", err);
      setTrashedContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashList();
  }, []);

  // 2. Khôi phục liên hệ
  const handleRestore = async (id) => {
    if (!window.confirm("Bạn có muốn khôi phục liên hệ này?")) return;

    try {
      await restoreContact(id);
      alert("✅ Đã khôi phục liên hệ thành công!");
      setTrashedContacts((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi khôi phục liên hệ:", error);
      alert("❌ Khôi phục liên hệ thất bại!");
    }
  };

  // 3. Xóa vĩnh viễn liên hệ
  const handleForceDelete = async (id) => {
    if (
      !window.confirm(
        "⚠️ CẢNH BÁO: Liên hệ này sẽ bị xóa VĨNH VIỄN khỏi database và không thể lấy lại. Bạn có chắc không?"
      )
    )
      return;

    try {
      await forceDeleteContact(id);
      alert("✅ Đã xóa vĩnh viễn liên hệ!");
      setTrashedContacts((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi xóa vĩnh viễn:", error);
      alert("❌ Xóa vĩnh viễn thất bại!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & nút quay lại */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/contacts"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-rose-500" />
              Thùng Rác Liên Hệ
            </h1>
            <p className="text-sm text-gray-500">
              Danh sách các thư liên hệ đã xóa tạm thời
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
                <th className="py-4 px-4">Khách hàng</th>
                <th className="py-4 px-4">Nội dung đã xóa</th>
                <th className="py-4 px-4 w-36">Thời gian xóa</th>
                <th className="py-4 px-4 w-40 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Đang tải danh sách thùng rác...
                  </td>
                </tr>
              ) : trashedContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Thùng rác trống. Chưa có liên hệ nào bị xóa.
                  </td>
                </tr>
              ) : (
                trashedContacts.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/75 transition-colors">
                    {/* STT */}
                    <td className="py-4 px-4 text-center text-gray-500 font-medium">
                      {index + 1}
                    </td>

                    {/* Khách hàng */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-0.5">
                        {item.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {item.phone}
                          </span>
                        )}
                        {item.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" /> {item.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Nội dung tin nhắn */}
                    <td className="py-4 px-4 max-w-sm">
                      <p className="line-clamp-2 text-gray-600 text-xs leading-relaxed">
                        {item.message}
                      </p>
                    </td>

                    {/* Ngày xóa */}
                    <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {item.deleted_at || "—"}
                    </td>

                    {/* Hành động */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                          title="Khôi phục liên hệ"
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
