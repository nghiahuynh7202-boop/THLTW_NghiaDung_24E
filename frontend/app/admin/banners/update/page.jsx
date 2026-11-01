"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBannerById, updateBanner } from "@/services/bannerServices";
import { ImageIcon, ArrowLeft, Upload, RefreshCw } from "lucide-react";

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

function EditBannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [link, setLink] = useState("/products");
  const [orderNum, setOrderNum] = useState(1);
  const [status, setStatus] = useState("1");

  // 1. Tải thông tin banner cũ
  useEffect(() => {
    if (!id) {
      setFetching(false);
      setError("Không tìm thấy mã banner!");
      return;
    }

    const fetchBanner = async () => {
      try {
        setFetching(true);
        const res = await getBannerById(id);
        const b = res?.data || res;
        if (!b || !b.id) {
          setError("Không tìm thấy banner tương ứng!");
          return;
        }

        setLink(b.link || "");
        setOrderNum(b.order_num ?? 0);
        setStatus(String(b.status ?? "1"));
        if (b.image) {
          setCurrentImage(b.image);
        }
      } catch (err) {
        console.error("Lỗi lấy banner:", err);
        setError("Không thể tải thông tin banner.");
      } finally {
        setFetching(false);
      }
    };

    fetchBanner();
  }, [id]);

  // Khi chọn file ảnh mới
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 2. Gửi form cập nhật banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const formData = new FormData();
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      formData.append("link", link);
      formData.append("order_num", orderNum);
      formData.append("status", status);

      await updateBanner(id, formData);
      alert("✅ Cập nhật banner thành công!");
      router.push("/admin/banners");
    } catch (err) {
      console.error("Lỗi cập nhật banner:", err);
      const msg = err.response?.data?.message || "Lỗi cập nhật banner!";
      setError(msg);
      alert("❌ " + msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50/60 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin text-[#f68b1f]" />
          <span>Đang tải thông tin banner...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/banners")}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-[#f68b1f]" />
                <span>Chỉnh sửa Banner #{id}</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Cập nhật hình ảnh, đường dẫn liên kết và thứ tự hiển thị banner
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Khung Form chỉnh sửa */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Cột trái: Hình ảnh banner */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Hình ảnh banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#f68b1f] hover:file:bg-orange-100 cursor-pointer border border-gray-200 rounded-lg p-1"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Để trống nếu muốn giữ nguyên ảnh hiện tại.
                </p>

                {/* Preview ảnh hiện tại hoặc ảnh mới chọn */}
                <div className="mt-3">
                  <span className="text-[11px] font-medium text-gray-500 block mb-1">
                    {previewUrl ? "Ảnh mới được chọn:" : "Ảnh hiện tại:"}
                  </span>
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-36 flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Xem trước banner mới"
                        className="w-full h-full object-cover"
                      />
                    ) : currentImage ? (
                      <img
                        src={resolveImgUrl(currentImage)}
                        alt="Banner hiện tại"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Thông tin liên kết, thứ tự, trạng thái */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Đường dẫn liên kết khi bấm vào banner
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="VD: /products hoặc /category/hoa-sinh-nhat"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Khi khách click vào banner trên trang chủ sẽ chuyển hướng đến link này.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={orderNum}
                    onChange={(e) => setOrderNum(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Số nhỏ hơn sẽ hiển thị trước trong vòng xoay banner.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Trạng thái hiển thị
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] bg-white text-gray-700"
                  >
                    <option value="1">Hiển thị trên trang chủ</option>
                    <option value="0">Đã ẩn (Tạm dừng)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/banners")}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-[#f68b1f] hover:bg-[#e67300] disabled:bg-gray-300 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{loading ? "Đang lưu..." : "Lưu thay đổi"}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditBannerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-xs">Đang tải banner...</div>}>
      <EditBannerContent />
    </Suspense>
  );
}
