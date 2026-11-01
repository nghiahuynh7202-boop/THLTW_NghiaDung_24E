"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/shop/ui/Pagination";
import { getAdminProducts, deleteProduct, toggleProductStatus } from "@/services/productServices";
import { Trash2, Plus, Edit2, Package, Image as ImageIcon, Search, Eye, EyeOff, AlertCircle } from "lucide-react";
import API_CONFIG from "@/config/api";

const ITEMS_PER_PAGE = 5;

// Hiển thị ảnh sản phẩm từ backend storage
function ProductImage({ item }) {
  const [hasError, setHasError] = useState(false);
  const image = item.image ? String(item.image).trim() : "";

  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("blob:")) return img;
    const clean = img.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `${API_CONFIG.ROOT_URL}/storage/${clean}`;
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

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Tải danh sách sản phẩm từ backend
  const loadProducts = () => {
    setIsLoading(true);
    getAdminProducts()
      .then((res) => setProducts(res.data || []))
      .catch((err) => {
        console.error("Lỗi lấy sản phẩm:", err);
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [refresh]);

  // Bật/Tắt trạng thái hiển thị của sản phẩm (Hiển thị <-> Tạm ẩn)
  const handleToggle = async (item) => {
    try {
      const res = await toggleProductStatus(item.id);
      const newStatus = Number(item.status) === 1 ? 0 : 1;
      setProducts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: newStatus } : p))
      );
      alert("✅ " + (res?.data?.message || res?.message || (newStatus === 1 ? "Đã hiển thị sản phẩm công khai!" : "Đã tạm ẩn sản phẩm!")));
    } catch (err) {
      console.error("Lỗi đổi trạng thái:", err);
      alert("❌ " + (err.response?.data?.message || "Không thể thay đổi trạng thái!"));
    }
  };

  // Xóa tạm sản phẩm vào thùng rác
  const handleDelete = (item) => {
    const ordersCount = Number(item.orders_count || item.order_details_count || 0);

    // KIỂM TRA: Nếu sản phẩm đang có đơn hàng, không được phép xóa!
    if (ordersCount > 0) {
      const wantHide = window.confirm(
        `⚠️ SẢN PHẨM KHÔNG ĐƯỢC PHÉP XÓA!\n\nSản phẩm "${item.name}" đang có ${ordersCount} đơn hàng trong hệ thống.\n\nTheo quy định để tránh mất lịch sử đơn hàng: Bạn chỉ có thể TẠM ẨN sản phẩm này khỏi shop.\n\n👉 Bạn có muốn chuyển sang trạng thái "TẠM ẨN" ngay bây giờ không?`
      );
      if (wantHide) {
        if (Number(item.status) === 1) {
          handleToggle(item);
        } else {
          alert("ℹ️ Sản phẩm này hiện tại đã ở trạng thái Tạm ẩn rồi!");
        }
      }
      return;
    }

    if (!window.confirm(`Bạn chắc chắn muốn chuyển sản phẩm "${item.name}" vào thùng rác?`)) return;

    deleteProduct(item.id)
      .then(() => {
        alert("✅ Đã chuyển sản phẩm vào thùng rác!");
        setProducts((prev) => prev.filter((p) => p.id !== item.id));
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || "Xóa thất bại";
        alert("❌ " + errorMsg);
        // Nếu backend thông báo đã chuyển sang tạm ẩn vì có đơn hàng
        if (err.response?.data?.status === "has_orders") {
          setProducts((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, status: 0 } : p))
          );
        }
      });
  };

  // Lọc sản phẩm theo từ khóa và trạng thái
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (statusFilter !== "all" && String(item.status) !== String(statusFilter)) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(term);
        const matchSlug = item.slug?.toLowerCase().includes(term);
        return matchName || matchSlug;
      }
      return true;
    });
  }, [products, statusFilter, searchTerm]);

  // Tính toán phân trang phía client
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push("/admin/products/trash")}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Thùng rác</span>
            </button>

            <button
              onClick={() => router.push("/admin/products/create")}
              className="inline-flex items-center gap-1.5 bg-[#f68b1f] hover:bg-[#e67300] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* Bảng danh sách sản phẩm */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Thanh tiêu đề con & Bộ lọc */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách sản phẩm</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {filteredProducts.length}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Ô tìm kiếm */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm tên, slug sản phẩm..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] w-48 sm:w-56"
                />
              </div>

              {/* Lọc trạng thái */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1.5 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white text-gray-600"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Hiển thị</option>
                <option value="0">Đã ẩn</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[11px]">
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
                      Đang tải sản phẩm...
                    </td>
                  </tr>
                ) : currentProducts.length > 0 ? (
                  currentProducts.map((item, index) => {
                    const price = Number(item.price || 0);
                    const salePrice = Number(item.sale_price || 0);
                    const hasSale = salePrice > 0 && salePrice < price;

                    return (
                      <tr key={item.id || index} className="hover:bg-orange-50/20">
                        <td className="py-3 px-4 text-center text-gray-500">
                          {startIndex + index + 1}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <ProductImage item={item} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-800">
                              {item.name}
                            </span>
                            {Number(item.is_featured) === 1 && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                ⭐ Nổi bật
                              </span>
                            )}
                            {Number(item.orders_count || item.order_details_count || 0) > 0 && (
                              <span
                                className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                                title={`Sản phẩm đang có ${item.orders_count || item.order_details_count} đơn hàng trong hệ thống (Không được xóa, chỉ được tạm ẩn)`}
                              >
                                📦 {item.orders_count || item.order_details_count} đơn (chỉ tạm ẩn)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">{item.slug}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={hasSale ? "text-gray-400 line-through" : "font-semibold text-[#d32f2f]"}>
                            {price.toLocaleString("vi-VN")} đ
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {hasSale ? (
                            <span className="font-semibold text-[#f68b1f]">
                              {salePrice.toLocaleString("vi-VN")} đ
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {Number(item.qty || 0)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(item)}
                            title="Bấm để đổi trạng thái Hiển thị / Tạm ẩn"
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            {Number(item.status) === 1 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold hover:bg-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Hiển thị
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold hover:bg-gray-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                Đã tạm ẩn
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Nút bật/tắt Tạm ẩn nhanh */}
                            <button
                              type="button"
                              onClick={() => handleToggle(item)}
                              className={`px-2 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors flex items-center gap-1 ${
                                Number(item.status) === 1
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-300"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300"
                              }`}
                              title={Number(item.status) === 1 ? "Bấm để tạm ẩn sản phẩm khỏi shop" : "Bấm để mở hiển thị lại sản phẩm"}
                            >
                              {Number(item.status) === 1 ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>Tạm ẩn</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>Hiện lại</span>
                                </>
                              )}
                            </button>

                            {/* Nút sửa */}
                            <button
                              onClick={() => router.push(`/admin/products/update?id=${item.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md cursor-pointer"
                              title="Chỉnh sửa sản phẩm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Nút xóa: Nếu có đơn hàng thì khóa nút xóa và chỉ cho phép tạm ẩn */}
                            {Number(item.orders_count || item.order_details_count || 0) > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const wantHide = window.confirm(
                                    `⚠️ SẢN PHẨM KHÔNG THỂ XÓA!\n\nSản phẩm "${item.name}" đang có ${item.orders_count || item.order_details_count} đơn hàng trong hệ thống.\n\nTheo quy định của hệ thống: Sản phẩm đã phát sinh đơn hàng KHÔNG ĐƯỢC PHÉP XÓA để bảo toàn lịch sử mua hàng của khách.\n\n👉 Bạn chỉ có thể TẠM ẨN sản phẩm này. Bạn có muốn chuyển sang trạng thái "TẠM ẨN" ngay không?`
                                  );
                                  if (wantHide) {
                                    if (Number(item.status) === 1) {
                                      handleToggle(item);
                                    } else {
                                      alert("ℹ️ Sản phẩm này hiện tại đã ở trạng thái Tạm ẩn rồi!");
                                    }
                                  }
                                }}
                                className="p-1.5 rounded-md border border-gray-200 text-gray-400 bg-gray-50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 cursor-pointer transition-colors"
                                title="Sản phẩm đang có đơn hàng: KHÔNG ĐƯỢC XÓA - Chỉ được tạm ẩn"
                              >
                                <Trash2 className="w-3.5 h-3.5 opacity-40" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="p-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                                title="Chuyển sản phẩm vào thùng rác"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400">
                      Chưa có sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
