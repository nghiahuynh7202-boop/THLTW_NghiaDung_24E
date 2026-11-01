"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSale } from "@/services/saleServices";
import { Tag, ArrowLeft, Plus } from "lucide-react";

export default function CreateSalePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: "",
    code: "",
    apply_to: "order",
    discount_type: "percent",
    discount_value: "",
    max_discount: "",
    min_order: "0",
    usage_limit: "100",
    date_begin: today,
    date_end: nextMonth,
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Vui lòng nhập tên chương trình");
    if (!form.date_begin || !form.date_end) return alert("Vui lòng chọn thời hạn khuyến mãi");

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        code: form.code ? form.code.trim().toUpperCase() : null,
        discount_value: form.discount_value !== "" ? Number(form.discount_value) : null,
        max_discount: form.max_discount !== "" ? Number(form.max_discount) : null,
        min_order: form.min_order !== "" ? Number(form.min_order) : 0,
        usage_limit: form.usage_limit !== "" ? Number(form.usage_limit) : null,
        status: Number(form.status),
      };

      await createSale(payload);
      alert("✅ Thêm khuyến mãi mới thành công!");
      router.push("/admin/sales");
    } catch (err) {
      console.error("Lỗi thêm khuyến mãi:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi thêm khuyến mãi";
      alert("❌ " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/sales"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Tag className="w-6 h-6 text-amber-500" />
              Tạo Khuyến Mãi Mới
            </h1>
            <p className="text-sm text-gray-500">Tạo mã giảm giá và cài đặt điều kiện áp dụng</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên chương trình khuyến mãi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Giảm giá ngày 8/3, Tri ân khách hàng..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mã Coupon (Nhập khi thanh toán)
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="Ví dụ: GIAM10K, HOACUOI20..."
                className="w-full px-4 py-2.5 text-sm font-mono font-bold uppercase rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Loại áp dụng
              </label>
              <select
                value={form.apply_to}
                onChange={(e) => setForm({ ...form, apply_to: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 bg-white"
              >
                <option value="order">Áp dụng cho toàn bộ Đơn hàng (Coupon)</option>
                <option value="product">Áp dụng cho Sản phẩm</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Hình thức giảm
              </label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 bg-white"
              >
                <option value="percent">Giảm theo % (Phần trăm)</option>
                <option value="amount">Giảm số tiền cố định (VNĐ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mức giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === "percent" ? "Ví dụ: 10 (10%)" : "Ví dụ: 50000"}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Giảm tối đa (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                value={form.max_discount}
                onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                placeholder="Bỏ trống nếu không giới hạn"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                placeholder="0 nếu không yêu cầu"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Số lần dùng tối đa
              </label>
              <input
                type="number"
                min="1"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                placeholder="Ví dụ: 100"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.date_begin}
                onChange={(e) => setForm({ ...form, date_begin: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.date_end}
                onChange={(e) => setForm({ ...form, date_end: e.target.value })}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value={1}>Kích hoạt (Cho phép áp dụng)</option>
              <option value={0}>Tạm tắt</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/sales"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Đang lưu..." : "Tạo Mới Khuyến Mãi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
