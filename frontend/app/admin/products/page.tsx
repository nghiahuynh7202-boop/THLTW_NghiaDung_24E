"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/shop/ui/Pagination";
import { getAdminProducts, deleteProduct, ProductItem } from "@/services/productServices";
import { RefreshCw, Trash2, Plus, Edit2, Package, Image as ImageIcon } from "lucide-react";

const ITEMS_PER_PAGE = 5;

// Component hiển thị hình ảnh sản phẩm từ thư mục Storage Backend
function ProductImage({ item }: { item: ProductItem }) {
  const [hasError, setHasError] = useState(false);

  const image = item.image ? String(item.image).trim() : "";

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("blob:")) {
      return img;
    }
    const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
    const cleanPath = img.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://${hostname}:8000/storage/${cleanPath}`;
  };

  if (!image || hasError) {
    return (
      <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
        <ImageIcon className="w-5 h-5 text-gray-300" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
      <img
        src={getImageUrl(image)}
        alt={item.name || "Sản phẩm"}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function ProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refresh = searchParams.get("refresh");

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAllProducts();
  }, [refresh, fetchAllProducts]);

  const pageCount = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này vào thùng rác?")) return;
    try {
      await deleteProduct(id);
      alert("✅ Đã chuyển sản phẩm vào thùng rác!");

      const remaining = products.filter((p) => String(p.id) !== String(id));
      setProducts(remaining);

      const newPageCount = Math.max(1, Math.ceil(remaining.length / ITEMS_PER_PAGE));
      if (currentPage > newPageCount) setCurrentPage(newPageCount);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Xóa thất bại";
      alert("❌ " + msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang tinh gọn, nhẹ nhàng */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#f68b1f]" />
              <span>Quản lý Sản phẩm</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý danh sách hoa tươi, giá bán và tồn kho
            </p>
          </div>

          {/* Các nút hành động */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push("/admin/products?refresh=" + Date.now())}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Làm mới</span>
            </button>

            <button
              onClick={() => router.push("/admin/products/trash")}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Thùng rác</span>
            </button>

            <button
              onClick={() => router.push("/admin/products/create")}
              className="inline-flex items-center gap-1.5 bg-[#f68b1f] hover:bg-[#e67300] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* Khung Card chính */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Thanh tiêu đề con */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách sản phẩm</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-14 text-center">STT</th>
                  <th className="py-3 px-4 w-16 text-center">Ảnh</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">Giá gốc</th>
                  <th className="py-3 px-4">Giá Sale</th>
                  <th className="py-3 px-4 text-center">Tồn kho</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-28">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải sản phẩm...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentProducts.length > 0 ? (
                  currentProducts.map((item, index) => {
                    const salePriceNum = Number(item.sale_price || 0);
                    const priceNum = Number(item.price || 0);
                    const hasSale = salePriceNum > 0 && (salePriceNum < priceNum || priceNum === 0);

                    return (
                      <tr
                        key={item.id || index}
                        className="hover:bg-orange-50/20 transition-colors"
                      >
                        {/* STT */}
                        <td className="py-3 px-4 text-center text-gray-500 font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>

                        {/* Ảnh */}
                        <td className="py-3 px-4 text-center">
                          <ProductImage item={item} />
                        </td>

                        {/* Tên + slug */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800 text-xs">
                            {item.name || "Không có tên"}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">
                            {item.slug || "-"}
                          </span>
                        </td>

                        {/* Giá gốc */}
                        <td className="py-3 px-4">
                          <span
                            className={
                              hasSale
                                ? "text-gray-400 line-through text-[11px]"
                                : "font-semibold text-[#d32f2f]"
                            }
                          >
                            {Number(item.price || 0).toLocaleString("vi-VN")} đ
                          </span>
                        </td>

                        {/* Giá sale */}
                        <td className="py-3 px-4">
                          {hasSale ? (
                            <span className="font-semibold text-[#f68b1f]">
                              {Number(item.sale_price).toLocaleString("vi-VN")} đ
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        {/* Tồn kho */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`font-semibold ${
                              Number(item.qty ?? 0) > 0 ? "text-gray-700" : "text-red-500"
                            }`}
                          >
                            {Number(item.qty ?? 0)}
                          </span>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3 px-4 text-center">
                          {Number(item.status) === 1 ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Hiển thị
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              Đã ẩn
                            </span>
                          )}
                        </td>

                        {/* Hành động */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => router.push(`/admin/products/update?id=${item.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer"
                              title="Chuyển vào thùng rác"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-medium text-gray-500">Chưa có sản phẩm nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="bg-gray-50/50 border-t border-gray-100 px-5 py-3">
              <Pagination
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 text-xs">Đang tải sản phẩm...</div>}>
      <ProductContent />
    </Suspense>
  );
}
