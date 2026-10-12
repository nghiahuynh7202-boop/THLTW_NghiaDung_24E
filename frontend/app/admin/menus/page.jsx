"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMenus, deleteMenu } from "@/services/menuServices";
import { Navigation, Plus, RefreshCw, Trash2, Edit2 } from "lucide-react";

export default function MenusPage() {
  const router = useRouter();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Tải danh sách menu
  const loadMenus = async () => {
    setLoading(true);
    try {
      const data = await getMenus({ per_page: 100 });
      setMenus(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  // 2. Xóa menu (chuyển vào thùng rác)
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn chuyển menu "${name}" vào thùng rác?`)) return;
    try {
      await deleteMenu(id);
      setMenus(menus.filter((m) => m.id !== id));
      alert("Đã chuyển menu vào thùng rác thành công!");
    } catch (err) {
      alert("Lỗi khi xóa menu!");
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Tiêu đề & Các nút thao tác */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#2980b9]" />
            <span>Quản lý Menu</span>
          </h1>
          <p className="text-xs text-gray-500">Quản lý các liên kết menu điều hướng của website</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Làm mới */}
          <button
            onClick={loadMenus}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Làm mới</span>
          </button>

          {/* Nút Thùng rác */}
          <button
            onClick={() => router.push("/admin/menus/trash")}
            className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Thùng rác</span>
          </button>

          {/* Nút Thêm menu */}
          <button
            onClick={() => router.push("/admin/menus/create")}
            className="text-xs bg-[#2980b9] hover:bg-blue-600 text-white px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm menu</span>
          </button>
        </div>
      </div>

      {/* Bảng danh sách menu */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 font-semibold uppercase text-[11px]">
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Tên Menu</th>
              <th className="p-3">Đường dẫn (Link)</th>
              <th className="p-3 text-center w-24">Thứ tự</th>
              <th className="p-3 text-center w-28">Trạng thái</th>
              <th className="p-3 text-center w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  Đang tải danh sách menu...
                </td>
              </tr>
            ) : menus.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  Chưa có menu nào. Hãy nhấn &quot;Thêm menu&quot; để tạo mới.
                </td>
              </tr>
            ) : (
              menus.map((item, idx) => {
                const isActive = Number(item.status) === 1;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 text-center text-gray-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-gray-800">{item.name}</td>
                    <td className="p-3 text-blue-600 font-mono text-[11px]">{item.link}</td>
                    <td className="p-3 text-center font-semibold text-gray-700">{item.order_num}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isActive ? "Hoạt động" : "Tạm ẩn"}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-1.5 whitespace-nowrap">
                      {/* Nút sửa chuyển sang trang update */}
                      <button
                        onClick={() => router.push(`/admin/menus/update?id=${item.id}`)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 p-1.5 rounded-md cursor-pointer transition inline-flex items-center"
                        title="Chỉnh sửa menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Nút xóa tạm vào thùng rác */}
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100 p-1.5 rounded-md cursor-pointer transition inline-flex items-center"
                        title="Chuyển vào thùng rác"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
