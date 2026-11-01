"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTrashMenus, restoreMenu, forceDeleteMenu } from "@/services/menuServices";
import { Trash2, ArrowLeft, RotateCcw, RefreshCw } from "lucide-react";

export default function TrashMenuPage() {
  const router = useRouter();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Tải danh sách menu trong thùng rác
  const loadTrash = async () => {
    setLoading(true);
    try {
      const data = await getTrashMenus();
      setMenus(data);
    } catch (err) {
      console.error("Lỗi tải thùng rác:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  // 2. Khôi phục menu
  const handleRestore = async (id, name) => {
    if (!window.confirm(`Khôi phục menu "${name}"?`)) return;
    try {
      await restoreMenu(id);
      setMenus(menus.filter((m) => m.id !== id));
      alert("Khôi phục menu thành công!");
    } catch (err) {
      alert("Lỗi khi khôi phục!");
    }
  };

  // 3. Xóa vĩnh viễn menu
  const handleForceDelete = async (id, name) => {
    if (!window.confirm(`⚠️ CẢNH BÁO: Xóa VĨNH VIỄN menu "${name}"? Thao tác này không thể hoàn tác!`)) return;
    try {
      await forceDeleteMenu(id);
      setMenus(menus.filter((m) => m.id !== id));
      alert("Đã xóa vĩnh viễn menu!");
    } catch (err) {
      alert("Lỗi khi xóa vĩnh viễn!");
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <span>Thùng rác — Menu</span>
          </h1>
          <p className="text-xs text-gray-500">Danh sách các menu đã xóa tạm. Bạn có thể khôi phục hoặc xóa hẳn.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTrash}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => router.push("/admin/menus")}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* Bảng thùng rác */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 font-semibold uppercase text-[11px]">
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Tên Menu</th>
              <th className="p-3">Đường dẫn</th>
              <th className="p-3 text-center">Thời gian xóa</th>
              <th className="p-3 text-center w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  Đang tải thùng rác...
                </td>
              </tr>
            ) : menus.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  Thùng rác trống. Không có menu nào đã xóa.
                </td>
              </tr>
            ) : (
              menus.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 text-center text-gray-400">{idx + 1}</td>
                  <td className="p-3 font-bold text-gray-800">{item.name}</td>
                  <td className="p-3 text-gray-600 font-mono text-[11px]">{item.link}</td>
                  <td className="p-3 text-center text-gray-400">{item.deleted_at || "—"}</td>
                  <td className="p-3 text-center space-x-1.5 whitespace-nowrap">
                    {/* Khôi phục */}
                    <button
                      onClick={() => handleRestore(item.id, item.name)}
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded text-xs font-medium cursor-pointer inline-flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Khôi phục</span>
                    </button>

                    {/* Xóa vĩnh viễn */}
                    <button
                      onClick={() => handleForceDelete(item.id, item.name)}
                      className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1 rounded text-xs font-medium cursor-pointer inline-flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa hẳn</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
