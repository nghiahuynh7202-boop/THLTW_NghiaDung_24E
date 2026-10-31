"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, CheckCircle, Upload, X } from "lucide-react";
import { getAdminBanners, createBanner, deleteBanner } from "@/services/bannerServices";

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

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // State mở form thêm banner
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [link, setLink] = useState("/products");
  const [orderNum, setOrderNum] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Lấy danh sách banner
  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await getAdminBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách banner:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Khi chọn file ảnh -> tạo link preview
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Gửi form thêm banner
  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Vui lòng chọn 1 hình ảnh làm banner!");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      if (link) formData.append("link", link);
      formData.append("order_num", orderNum);
      formData.append("status", 1);

      await createBanner(formData);
      alert("Thêm banner mới thành công!");

      // Reset form
      setSelectedFile(null);
      setPreviewUrl("");
      setShowAddForm(false);
      loadBanners();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tải ảnh banner lên server!");
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa banner
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa banner này?")) return;
    try {
      await deleteBanner(id);
      alert("Đã xóa banner thành công!");
      loadBanners();
    } catch {
      alert("Lỗi khi xóa banner!");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Thanh tiêu đề & Nút thêm */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-[#2980b9]" />
              <span>Quản Lý Banner Trang Chủ</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Thêm và quản lý các banner quảng cáo tự động chuyển động trên trang chủ
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2980b9] hover:bg-[#20638f] text-white text-xs font-bold rounded-lg shadow-xs transition"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? "Đóng form" : "Thêm Banner Mới"}</span>
          </button>
        </div>

        {/* FORM THÊM BANNER MỚI */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
            <h2 className="text-sm font-bold text-slate-800 uppercase border-b pb-2 mb-4">
              Thêm Banner Mới Lên Trang Chủ
            </h2>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Chọn file ảnh & preview */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chọn hình ảnh banner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2980b9] hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg p-1"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Khuyến nghị: Ảnh ngang tỉ lệ 3:1 hoặc 4:1 (Ví dụ: 1200x400px), dưới 2MB.
                  </p>

                  {/* Khung xem trước ảnh */}
                  {previewUrl && (
                    <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-32 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Xem trước banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Liên kết và thứ tự */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Đường dẫn liên kết khi bấm vào banner
                    </label>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="VD: /products hoặc /category/hoa-sinh-nhat"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#2980b9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thứ tự hiển thị (Số nhỏ chạy trước)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={orderNum}
                      onChange={(e) => setOrderNum(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#2980b9]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{submitting ? "Đang tải lên..." : "Tải Lên & Lưu Banner"}</span>
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* BẢNG DANH SÁCH BANNER */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh Sách Banner ({banners.length})
            </span>
            <span className="text-xs text-slate-400">
              Các banner này sẽ tự động chuyển động xoay vòng trên trang chủ
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Đang tải danh sách banner...
            </div>
          ) : banners.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Chưa có banner nào trong cơ sở dữ liệu.</p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy bấm nút &quot;Thêm Banner Mới&quot; ở trên để tải ảnh lên nhé!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100/75 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4 w-52">Hình ảnh Banner</th>
                    <th className="py-3 px-4">Đường dẫn liên kết</th>
                    <th className="py-3 px-4 w-24 text-center">Thứ tự</th>
                    <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
                    <th className="py-3 px-4 w-20 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {banners.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-44 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                          <img
                            src={resolveImgUrl(item.image)}
                            alt="Banner"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/images/hoa.jpg";
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                        {item.link || "/"}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">
                        {item.order_num ?? 0}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3" />
                          <span>Hiển thị</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="Xóa banner này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
