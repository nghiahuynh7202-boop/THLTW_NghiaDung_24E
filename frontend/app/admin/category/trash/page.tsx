"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosAdmin from "@/lib/axiosAdmin";
import { CategoryItem } from "@/services/categoryServices";

// Route endpoints backend
const ADMIN = "/admin/categories";
const TRASH_URL = `${ADMIN}/trash`;
const restoreUrl = (id: number | string) => `${ADMIN}/${id}/restore`;
const forceUrl = (id: number | string) => `${ADMIN}/${id}/force`;

const PAGE_SIZE = 10;

export default function TrashCategoryPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pageCount: 1 });

    const fetchTrashed = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const res = (await axiosAdmin.get(TRASH_URL, {
                params: { page, per_page: PAGE_SIZE },
            })) as any;

            // axiosAdmin đã bóc response.data, nên res chính là body của Laravel
            const list = Array.isArray(res) ? res : res?.data ?? [];
            const meta = res?.meta ?? res?.pagination ?? {};

            setCategories(Array.isArray(list) ? list : []);
            setPagination({
                total: meta.total ?? list.length,
                pageCount: meta.last_page ?? meta.pageCount ?? 1,
            });
        } catch (err) {
            console.error("Lỗi lấy thùng rác danh mục:", err);
            setCategories([]);
            setPagination({ total: 0, pageCount: 1 });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchTrashed(currentPage);
    }, [currentPage, fetchTrashed]);

    // Sau khi khôi phục/xóa: nếu trang hiện tại hết dữ liệu thì lùi về trang trước
    const reloadAfterChange = () => {
        if (categories.length === 1 && currentPage > 1) {
            setCurrentPage((p) => p - 1);
        } else {
            void fetchTrashed(currentPage);
        }
    };

    const handleRestore = async (id: number | string) => {
        if (!window.confirm("Khôi phục danh mục này?")) return;
        try {
            await axiosAdmin.patch(restoreUrl(id));
            alert("✅ Khôi phục thành công!");
            reloadAfterChange();
        } catch (err: any) {
            alert("❌ " + (err?.response?.data?.message || "Khôi phục thất bại"));
        }
    };

    const handleForceDelete = async (id: number | string) => {
        if (!window.confirm("⚠️ Xóa vĩnh viễn? Không thể hoàn tác!")) return;
        try {
            await axiosAdmin.delete(forceUrl(id));
            alert("✅ Đã xóa vĩnh viễn!");
            reloadAfterChange();
        } catch (err: any) {
            alert("❌ " + (err?.response?.data?.message || "Xóa thất bại"));
        }
    };

    // Chỉ xóa các mục đang hiển thị ở trang hiện tại
    const handleDeleteAll = async () => {
        if (!window.confirm(`⚠️ Xóa vĩnh viễn ${categories.length} danh mục trên trang này? Không thể hoàn tác!`)) return;

        const results = await Promise.allSettled(
            categories.map((c) => axiosAdmin.delete(forceUrl(c.id)))
        );
        const failed = results.filter((r) => r.status === "rejected").length;

        alert(failed === 0 ? "✅ Đã xóa tất cả!" : `⚠️ Có ${failed} danh mục xóa thất bại`);
        setCurrentPage(1);
        void fetchTrashed(1);
    };

    const totalPages = pagination.pageCount ?? 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <button
                        onClick={() => router.push("/admin/category")}
                        className="hover:text-blue-600 transition font-medium cursor-pointer"
                    >
                        🗂 Danh mục
                    </button>
                    <span>/</span>
                    <span className="text-red-500 font-semibold">🗑 Thùng rác</span>
                </div>

                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-1">🗑️ Thùng rác danh mục</h1>
                    <p className="text-gray-500 text-sm">
                        Danh mục đã xóa mềm — khôi phục hoặc xóa vĩnh viễn
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-6">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Danh sách đã xóa</h2>
                                <p className="text-red-100 mt-0.5 text-sm">
                                    Tổng: <strong>{pagination.total ?? 0}</strong> danh mục
                                </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => fetchTrashed(currentPage)}
                                    disabled={isLoading}
                                    className="bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold transition text-sm cursor-pointer"
                                >
                                    {isLoading ? "⟳ Đang tải..." : "⟳ Làm mới"}
                                </button>
                                {categories.length > 0 && (
                                    <button
                                        onClick={handleDeleteAll}
                                        className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition text-sm cursor-pointer"
                                    >
                                        🔥 Xóa hết trang này
                                    </button>
                                )}
                                <button
                                    onClick={() => router.push("/admin/category")}
                                    className="bg-white text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-xl font-bold transition shadow text-sm cursor-pointer"
                                >
                                    ← Quay lại
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-200 text-xs uppercase tracking-wide text-gray-600">
                                    <th className="py-4 px-5 text-left font-bold">STT</th>
                                    <th className="py-4 px-5 text-left font-bold">Tên danh mục</th>
                                    <th className="py-4 px-5 text-left font-bold">Slug</th>
                                    <th className="py-4 px-5 text-left font-bold">Danh mục cha</th>
                                    <th className="py-4 px-5 text-left font-bold">Ngày tạo</th>
                                    <th className="py-4 px-5 text-left font-bold">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
                                                <span className="text-sm">Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-20 text-gray-400">
                                            <p className="text-5xl mb-3">🎉</p>
                                            <p className="text-lg font-semibold text-gray-600">Thùng rác trống!</p>
                                            <p className="text-sm mt-1">Không có danh mục nào bị xóa</p>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b transition ${
                                                index % 2 === 0
                                                    ? "bg-white hover:bg-red-50"
                                                    : "bg-gray-50 hover:bg-red-50"
                                            }`}
                                        >
                                            {/* STT */}
                                            <td className="py-4 px-5">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500 font-bold text-sm">
                                                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                                                </span>
                                            </td>

                                            {/* Tên */}
                                            <td className="py-4 px-5">
                                                <p className="font-semibold text-gray-500 line-through">
                                                    {item.name || "Không có tên"}
                                                </p>
                                            </td>

                                            {/* Slug */}
                                            <td className="py-4 px-5">
                                                <code className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {item.slug || "-"}
                                                </code>
                                            </td>

                                            {/* Danh mục cha */}
                                            <td className="py-4 px-5 text-sm text-gray-400">
                                                {!item.parent_id ? (
                                                    <span className="text-blue-400 font-medium">Danh mục gốc</span>
                                                ) : (
                                                    <span>ID: {item.parent_id}</span>
                                                )}
                                            </td>

                                            {/* Ngày tạo */}
                                            <td className="py-4 px-5 text-sm text-gray-400">
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleDateString("vi-VN", {
                                                          day: "2-digit",
                                                          month: "2-digit",
                                                          year: "numeric",
                                                      })
                                                    : "-"}
                                            </td>

                                            {/* Hành động */}
                                            <td className="py-4 px-5">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRestore(item.id)}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition hover:scale-105 shadow-sm cursor-pointer"
                                                    >
                                                        ♻️ Khôi phục
                                                    </button>
                                                    <button
                                                        onClick={() => handleForceDelete(item.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition hover:scale-105 shadow-sm cursor-pointer"
                                                    >
                                                        🔥 Xóa hẳn
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-gray-50 border-t px-8 py-5 flex justify-center items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition text-sm font-medium cursor-pointer"
                            >
                                ← Trước
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded-lg border font-bold text-sm transition cursor-pointer ${
                                        currentPage === i + 1
                                            ? "bg-red-500 text-white shadow-sm"
                                            : "bg-white hover:bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition text-sm font-medium cursor-pointer"
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
