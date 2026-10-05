"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/shop/ui/Pagination";
import { getAdminProducts, deleteProduct, ProductItem } from "@/services/productServices";

const ITEMS_PER_PAGE = 5;

// Component hiển thị hình ảnh sản phẩm từ thư mục Storage Backend
function ProductImage({ item }: { item: ProductItem }) {
    const [hasError, setHasError] = useState(false);

    const image = item.image ? String(item.image).trim() : "";

    // Tạo URL ảnh từ backend storage hoặc URL trực tiếp
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
            <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 shadow-2xs">
                <span className="text-xl">🌸</span>
                <span className="text-[9px] font-medium text-gray-400 mt-0.5">Không có ảnh</span>
            </div>
        );
    }

    return (
        <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs shrink-0 flex items-center justify-center">
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

            // Xóa mục cuối của trang cuối thì lùi về trang trước
            const newPageCount = Math.max(1, Math.ceil(remaining.length / ITEMS_PER_PAGE));
            if (currentPage > newPageCount) setCurrentPage(newPageCount);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Xóa thất bại";
            alert("❌ " + msg);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Quản lý Sản phẩm</h1>
                    <p className="text-gray-600">Quản lý toàn bộ sản phẩm trong hệ thống</p>
                </div>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Danh sách sản phẩm</h2>
                                <p className="text-blue-100 mt-1">Tổng số: {products.length} sản phẩm</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={() => router.push("/admin/products?refresh=" + Date.now())}
                                    disabled={isLoading}
                                    className="bg-blue-400 text-white hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                                >
                                    {isLoading ? "⟳ Đang tải..." : "⟳ Làm mới"}
                                </button>
                                <button
                                    onClick={() => router.push("/admin/products/trash")}
                                    className="bg-red-500 text-white hover:bg-red-600 px-6 py-3 rounded-xl font-bold transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                                >
                                    🗑 Thùng rác
                                </button>
                                <button
                                    onClick={() => router.push("/admin/products/create")}
                                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                                >
                                    ✚ Thêm sản phẩm
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">STT</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Ảnh</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Tên sản phẩm</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Giá gốc</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Giá Sale</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Tồn kho</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Trạng thái</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                                <span className="text-sm">Đang tải sản phẩm...</span>
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
                                                className={`border-b transition duration-200 ${index % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"
                                                    }`}
                                            >
                                                {/* STT */}
                                                <td className="py-5 px-6">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                                    </span>
                                                </td>

                                                {/* Ảnh lấy trực tiếp từ Storage backend */}
                                                <td className="py-5 px-6">
                                                    <ProductImage item={item} />
                                                </td>

                                                {/* Tên + slug */}
                                                <td className="py-5 px-6">
                                                    <div className="font-semibold text-gray-900 mb-1">
                                                        {item.name || "Không có tên"}
                                                    </div>
                                                    <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">
                                                        {item.slug || "-"}
                                                    </code>
                                                </td>

                                                {/* Giá gốc */}
                                                <td className="py-5 px-6">
                                                    <span
                                                        className={`inline-block px-3 py-1.5 rounded-lg font-bold ${hasSale
                                                                ? "text-gray-400 line-through text-sm bg-gray-100"
                                                                : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {Number(item.price || 0).toLocaleString("vi-VN")} đ
                                                    </span>
                                                </td>

                                                {/* Giá sale */}
                                                <td className="py-5 px-6">
                                                    {hasSale ? (
                                                        <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-bold">
                                                            {Number(item.sale_price).toLocaleString("vi-VN")} đ
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">-</span>
                                                    )}
                                                </td>

                                                {/* Tồn kho */}
                                                <td className="py-5 px-6">
                                                    <span
                                                        className={`font-semibold ${Number(item.qty ?? 0) > 0 ? "text-gray-700" : "text-red-500"
                                                            }`}
                                                    >
                                                        {Number(item.qty ?? 0)}
                                                    </span>
                                                </td>

                                                {/* Trạng thái */}
                                                <td className="py-5 px-6">
                                                    {Number(item.status) === 1 ? (
                                                        <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-200">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                            Hiển thị
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase border border-gray-300">
                                                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                            Đã ẩn
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Hành động */}
                                                <td className="py-5 px-6">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => router.push(`/admin/products/update?id=${item.id}`)}
                                                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-sm cursor-pointer"
                                                            title="Sửa"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-sm cursor-pointer"
                                                            title="Xóa"
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-10 text-gray-500">
                                            <p className="text-lg font-semibold">📭 Không có sản phẩm nào</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    {pageCount > 1 && (
                        <div className="bg-gray-50 border-t px-8 py-6">
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
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải sản phẩm...</div>}>
            <ProductContent />
        </Suspense>
    );
}
