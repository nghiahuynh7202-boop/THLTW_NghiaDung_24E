"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getCategories,
  deleteCategory,
  updateCategory,
  CategoryItem,
} from "@/services/categoryServices";
import {
  Plus,
  Trash2,
  Edit,
  RotateCw,
  Search,
  Home,
  ChevronRight,
  ChevronLeft,
  Copy,
  CornerDownRight,
} from "lucide-react";

// Component hiển thị hình ảnh có xử lý fallback khi ảnh lỗi
function CategoryImage({ src, name }: { src: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-11 h-11 border border-gray-200 bg-gray-50 flex items-center justify-center text-sm shadow-2xs mx-auto">
        🌸
      </div>
    );
  }

  return (
    <div className="w-11 h-11 border border-gray-200 bg-white overflow-hidden flex items-center justify-center shadow-2xs mx-auto">
      <Image
        src={src}
        alt={name || "Danh mục"}
        width={44}
        height={44}
        unoptimized
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function buildCategoryTree(
  categories: CategoryItem[]
): { item: CategoryItem; isChild: boolean; level: number }[] {
  const parentList = categories.filter(
    (c) => !c.parent_id || c.parent_id === 0
  );
  const childList = categories.filter(
    (c) => c.parent_id && c.parent_id !== 0
  );

  const result: { item: CategoryItem; isChild: boolean; level: number }[] = [];

  if (parentList.length === 0 && childList.length === 0) {
    return categories.map((item) => ({ item, isChild: false, level: 0 }));
  }

  parentList.forEach((parent) => {
    result.push({ item: parent, isChild: false, level: 0 });
    const children = childList.filter((c) => c.parent_id === parent.id);
    children.forEach((child) => {
      result.push({ item: child, isChild: true, level: 1 });
    });
  });

  const addedIds = new Set(result.map((r) => r.item.id));
  categories.forEach((cat) => {
    if (!addedIds.has(cat.id)) {
      result.push({
        item: cat,
        isChild: Boolean(cat.parent_id),
        level: cat.parent_id ? 1 : 0,
      });
    }
  });

  return result;
}

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refresh = searchParams.get("refresh");

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("default");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const res = await getCategories();

        let list: CategoryItem[] = [];
        const resData = res.data as Record<string, unknown>;

        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(resData?.data)) {
          list = resData.data as CategoryItem[];
        } else if (Array.isArray(resData?.category)) {
          list = resData.category as CategoryItem[];
        } else if (Array.isArray(resData?.categories)) {
          list = resData.categories as CategoryItem[];
        }

        if (isMounted) {
          setCategories(list);
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  // Phân cấp cây danh mục
  const organizedCategories = useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  // Lọc theo tìm kiếm, trạng thái và sắp xếp
  const filteredCategories = useMemo(() => {
    const list = organizedCategories.filter(({ item }) => {
      const matchName = (item.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchSlug = (item.slug || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchSearch = matchName || matchSlug;

      if (statusFilter === "active") return matchSearch && Number(item.status) === 1;
      if (statusFilter === "hidden") return matchSearch && Number(item.status) === 0;
      if (statusFilter === "featured") return matchSearch && Boolean(item.is_featured);

      return matchSearch;
    });

    if (sortOrder === "name_asc") {
      return [...list].sort((a, b) => (a.item.name || "").localeCompare(b.item.name || ""));
    }
    if (sortOrder === "id_desc") {
      return [...list].sort((a, b) => b.item.id - a.item.id);
    }
    return list;
  }, [organizedCategories, searchTerm, statusFilter, sortOrder]);

  const totalItems = filteredCategories.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const currentCategories = useMemo(() => {
    return filteredCategories.slice(startIndex, startIndex + pageSize);
  }, [filteredCategories, startIndex, pageSize]);

  // Checkbox chọn tất cả
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentCategories.map(({ item }) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle nhanh trạng thái hoặc nổi bật
  const handleQuickToggle = async (
    item: CategoryItem,
    field: "status" | "is_featured"
  ) => {
    try {
      const updatedValue =
        field === "status"
          ? Number(item.status) === 1
            ? 0
            : 1
          : item.is_featured
          ? 0
          : 1;

      await updateCategory(item.id, {
        name: item.name,
        [field]: updatedValue,
      });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === item.id ? { ...c, [field]: updatedValue } : c
        )
      );
    } catch {
      alert("❌ Cập nhật trạng thái thất bại!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này vào thùng rác?")) return;
    try {
      await deleteCategory(id);
      alert("✅ Đã chuyển danh mục vào thùng rác!");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj?.response?.data?.message || errorObj?.message || "Xóa thất bại";
      alert("❌ " + msg);
    }
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return "Không thuộc danh mục";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : `#${parentId}`;
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. TITLE & BREADCRUMB HEADER (CHUẨN THEO ẢNH WEB30S) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-300 gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
          Danh sách danh mục hoa
        </h1>

        <div className="flex items-center text-xs text-gray-500 gap-1.5">
          <Link href="/admin" className="flex items-center gap-1 hover:text-[#2980b9]">
            <Home className="w-3.5 h-3.5 text-gray-600" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-700 font-semibold">Danh mục hoa</span>
        </div>
      </div>

      {/* 2. FILTER & ACTION TOOLBAR (THANH LỌC VÀ TÁC VỤ THEO ĐÚNG MẪU) */}
      <div className="bg-white p-2.5 border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Nhóm lọc bên trái */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ô nhập từ khóa tìm kiếm */}
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-52 sm:w-60 bg-white border border-gray-300 rounded-xs pl-2.5 pr-7 py-1.5 text-xs text-gray-800 outline-none focus:border-[#2980b9]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
          </div>

          {/* Lọc theo chủ đề / trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-gray-300 rounded-xs px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-[#2980b9]"
          >
            <option value="all">Chủ đề (Tất cả)</option>
            <option value="active">Đang hiển thị</option>
            <option value="hidden">Đang ẩn</option>
            <option value="featured">Tiêu biểu (Nổi bật)</option>
          </select>

          {/* Sắp xếp */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white border border-gray-300 rounded-xs px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-[#2980b9]"
          >
            <option value="default">Sắp xếp (Mặc định)</option>
            <option value="name_asc">Tên danh mục (A - Z)</option>
            <option value="id_desc">Mới nhất trước</option>
          </select>
        </div>

        {/* Nhóm nút bên phải */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/category?refresh=" + Date.now())}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 bg-[#3498db] hover:bg-[#2980b9] text-white px-3 py-1.5 rounded-xs text-xs font-semibold shadow-2xs transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Cập nhật</span>
          </button>

          <Link
            href="/admin/category/trash"
            className="inline-flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-xs text-xs font-semibold shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Thùng rác</span>
          </Link>

          <Link
            href="/admin/category/create"
            className="inline-flex items-center gap-1.5 bg-[#2980b9] hover:bg-[#2471a3] text-white px-3.5 py-1.5 rounded-xs text-xs font-bold shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </Link>
        </div>
      </div>

      {/* 3. BẢNG DỮ LIỆU (HEADER MÀU XANH #2980b9) */}
      <div className="bg-white border border-gray-300 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#2980b9] text-white font-bold text-[11px] tracking-wide select-none">
              <tr>
                <th className="py-2.5 px-3 w-14 text-center border-r border-[#2471a3]">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="checkbox"
                      checked={
                        currentCategories.length > 0 &&
                        selectedIds.length >= currentCategories.length
                      }
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 cursor-pointer accent-[#2980b9]"
                    />
                    <span>Xóa</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-14 text-center border-r border-[#2471a3]">
                  STT
                </th>
                <th className="py-2.5 px-4 border-r border-[#2471a3]">
                  TÊN DANH MỤC
                </th>
                <th className="py-2.5 px-3 w-20 text-center border-r border-[#2471a3]">
                  HÌNH ẢNH
                </th>
                <th className="py-2.5 px-3 w-40 text-center border-r border-[#2471a3]">
                  DANH MỤC CHA
                </th>
                <th className="py-2.5 px-3 w-20 text-center border-r border-[#2471a3]">
                  HIỂN THỊ
                </th>
                <th className="py-2.5 px-3 w-28 text-center">
                  TÁC VỤ
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-gray-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-[#2980b9] rounded-full animate-spin" />
                      <span className="text-xs">Đang tải dữ liệu danh mục...</span>
                    </div>
                  </td>
                </tr>
              ) : currentCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Không tìm thấy danh mục nào phù hợp.
                  </td>
                </tr>
              ) : (
                currentCategories.map(({ item, isChild, level }, index) => {
                  const imageUrl = item.image
                    ? item.image.startsWith("http")
                      ? item.image
                      : `http://127.0.0.1:8000/storage/${item.image}`
                    : null;

                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/40 transition-colors border-b border-gray-200 ${
                        isSelected ? "bg-blue-50/70" : "bg-white"
                      }`}
                    >
                      {/* Checkbox Xóa */}
                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-3.5 h-3.5 cursor-pointer accent-[#2980b9]"
                        />
                      </td>

                      {/* STT dạng ô nhỏ bo viền */}
                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        <span className="inline-block px-2 py-0.5 border border-gray-300 bg-gray-50 text-gray-700 text-xs font-semibold rounded-xs">
                          {startIndex + index + 1}
                        </span>
                      </td>

                      {/* Tên danh mục */}
                      <td className="py-2.5 px-4 border-r border-gray-200">
                        <div
                          className="flex flex-col gap-0.5"
                          style={{ paddingLeft: `${level * 20}px` }}
                        >
                          <div className="flex items-center gap-1.5">
                            {isChild && (
                              <CornerDownRight className="w-3.5 h-3.5 text-[#2980b9] shrink-0" />
                            )}
                            <Link
                              href={`/admin/category/update?id=${item.id}`}
                              className="font-bold text-gray-900 hover:text-[#2980b9] transition-colors"
                            >
                              {item.name || "Không có tên"}
                            </Link>
                            <span className="text-[10px] text-gray-400 font-mono">
                              #{item.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-gray-500">
                            <span className="text-[#e74c3c] font-bold font-mono">
                              {item.slug || "slug-danh-muc"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hình ảnh */}
                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        <CategoryImage src={imageUrl} name={item.name} />
                      </td>

                      {/* Danh mục cha */}
                      <td className="py-2 px-3 border-r border-gray-200 text-center text-[11px] text-gray-700">
                        {item.parent_id === 0 || !item.parent_id ? (
                          <span className="text-gray-400">Danh mục gốc</span>
                        ) : (
                          <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-200">
                            {getParentName(item.parent_id)}
                          </span>
                        )}
                      </td>

                      {/* Hiển thị */}
                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={Number(item.status) === 1}
                          onChange={() => handleQuickToggle(item, "status")}
                          className="w-4 h-4 cursor-pointer accent-[#2980b9]"
                          title="Bật / tắt hiển thị"
                        />
                      </td>

                      {/* Tác vụ: 3 icon Sửa, Sao chép, Xóa */}
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/category/update?id=${item.id}`}
                            className="p-1 text-[#2980b9] hover:text-[#1f618d] hover:bg-blue-50 rounded-xs transition-colors"
                            title="Sửa danh mục"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => router.push(`/admin/category/create`)}
                            className="p-1 text-[#3498db] hover:text-[#2980b9] hover:bg-blue-50 rounded-xs transition-colors"
                            title="Thêm danh mục mới tương tự"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-[#e74c3c] hover:text-[#c0392b] hover:bg-red-50 rounded-xs transition-colors"
                            title="Xóa vào thùng rác"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. THANH PHÂN TRANG */}
        <div className="bg-gray-50 border-t border-gray-200 p-2.5 flex justify-between items-center flex-wrap gap-2 text-xs text-gray-600">
          <div>
            Hiển thị <strong>{totalItems > 0 ? startIndex + 1 : 0}</strong> -{" "}
            <strong>{endIndex}</strong> trên tổng số <strong>{totalItems}</strong> danh mục
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 rounded-xs text-xs font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>

            {[...Array(pageCount)].map((_, i) => (
              <button
                key={i + 1}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 border text-xs font-bold rounded-xs transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#2980b9] text-white border-[#2980b9]"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 rounded-xs text-xs font-medium"
            >
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#2980b9] rounded-full animate-spin" />
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  );
}
