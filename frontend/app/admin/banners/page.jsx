"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Image as ImageIcon, Upload, X, Search, Edit2 } from "lucide-react";
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

function BannerRowImage({ image }) {
  const [hasError, setHasError] = useState(false);
  const src = resolveImgUrl(image);
  if (!src || hasError) {
    return <ImageIcon className="w-5 h-5 text-gray-300" />;
  }
  return (
    <img
      src={src}
      alt="Banner"
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Lọc banner theo liên kết và trạng thái
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      if (statusFilter !== "all" && String(b.status) !== String(statusFilter)) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return b.link?.toLowerCase().includes(term);
      }
      return true;
    });
  }, [banners, statusFilter, searchTerm]);

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
      alert("✅ Thêm banner mới thành công!");

      setSelectedFile(null);
      setPreviewUrl("");
      setShowAddForm(false);
      loadBanners();
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Lỗi tải ảnh banner lên server!"));
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa banner (chuyển vào thùng rác)
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn chuyển banner này vào thùng rác?")) return;
    try {
      await deleteBanner(id);
      alert("✅ Đã chuyển banner vào thùng rác thành công!");
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("❌ Lỗi khi xóa banner!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-[#f68b1f]" />
              <span>Quản lý Banner</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý danh sách các banner hiển thị xoay vòng trên trang chủ
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => router.push("/admin/banners/trash")}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Thùng rác</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 bg-[#f68b1f] hover:bg-[#e67300] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddForm ? "Đóng form" : "Thêm banner"}</span>
            </button>
          </div>
        </div>

        {/* FORM THÊM BANNER MỚI */}
        {showAddForm && (
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs animate-in fade-in">
            <h2 className="text-xs font-bold text-gray-800 uppercase border-b border-gray-100 pb-2.5 mb-4">
              Thêm banner mới lên trang chủ
            </h2>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chọn file ảnh */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Chọn hình ảnh banner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#f68b1f] hover:file:bg-orange-100 cursor-pointer border border-gray-200 rounded-lg p-1"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Khuyến nghị: Ảnh ngang tỉ lệ 3:1 hoặc 4:1 (Ví dụ: 1200x400px), dưới 2MB.
                  </p>

                  {/* Preview ảnh */}
                  {previewUrl && (
                    <div className="mt-3 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-28 flex items-center justify-center">
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Đường dẫn liên kết khi bấm vào banner
                    </label>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="VD: /products hoặc /category/hoa-sinh-nhat"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Thứ tự hiển thị (Số nhỏ chạy trước)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={orderNum}
                      onChange={(e) => setOrderNum(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 mt-2 bg-[#f68b1f] hover:bg-[#e67300] disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{submitting ? "Đang tải lên..." : "Tải lên & Lưu banner"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* BẢNG DANH SÁCH BANNER */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách banner</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {filteredBanners.length}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Ô tìm kiếm */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo đường dẫn liên kết..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] w-48 sm:w-56"
                />
              </div>

              {/* Lọc trạng thái */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white text-gray-600"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Hiển thị</option>
                <option value="0">Đã ẩn</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16 text-center">STT</th>
                  <th className="py-3 px-4 w-48">Hình ảnh</th>
                  <th className="py-3 px-4">Đường dẫn liên kết</th>
                  <th className="py-3 px-4 text-center w-24">Thứ tự</th>
                  <th className="py-3 px-4 text-center w-28">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-24">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải banner...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBanners.length > 0 ? (
                  filteredBanners.map((item, index) => (
                    <tr key={item.id} className="hover:bg-orange-50/20 transition-colors">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                        {index + 1}
                      </td>

                      {/* Hình ảnh */}
                      <td className="py-3.5 px-4">
                        <div className="w-40 h-14 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                          <BannerRowImage image={item.image} />
                        </div>
                      </td>

                      {/* Link */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded">
                          {item.link || "/"}
                        </span>
                      </td>

                      {/* Thứ tự */}
                      <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                        {item.order_num ?? 0}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Hiển thị
                        </span>
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/banners/update?id=${item.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition cursor-pointer"
                            title="Chỉnh sửa banner"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer"
                            title="Xóa banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-medium text-gray-500">Chưa có banner nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
