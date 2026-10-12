"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMenu } from "@/services/menuServices";
import { Navigation, ArrowLeft, Save } from "lucide-react";

export default function CreateMenuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    link: "",
    order_num: 1,
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.link.trim()) {
      alert("Vui lòng nhập đầy đủ tên menu và đường dẫn link!");
      return;
    }

    setLoading(true);
    try {
      await createMenu(form);
      alert("Thêm menu mới thành công!");
      router.push("/admin/menus");
    } catch (err) {
      alert("Lỗi khi thêm: " + (err?.response?.data?.message || err?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#2980b9]" />
            <span>Thêm Menu Mới</span>
          </h1>
          <p className="text-xs text-gray-500">Tạo liên kết menu điều hướng cho website</p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/menus")}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Form thêm menu */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 text-xs">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Tên Menu <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ví dụ: Trang chủ, Sản phẩm, Giới thiệu..."
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#2980b9]"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Đường dẫn (Link) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="Ví dụ: / hoặc /san-pham, /gioi-thieu..."
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#2980b9]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Thứ tự hiển thị</label>
            <input
              type="number"
              value={form.order_num}
              onChange={(e) => setForm({ ...form, order_num: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#2980b9]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#2980b9] bg-white"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Tạm ẩn</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/menus")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#2980b9] hover:bg-blue-600 text-white rounded-lg font-semibold cursor-pointer transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? "Đang lưu..." : "Lưu menu"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
