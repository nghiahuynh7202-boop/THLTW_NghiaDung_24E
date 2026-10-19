"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import ProductList from "@/components/products/ProductList";
import FilterSidebar, { PRICE_RANGES } from "@/components/products/FilterSidebar";
import { getAllProducts } from "@/services/productServices";
import { getPublicCategories } from "@/services/categoryServices";
import { getBrands } from "@/services/brandServices";
import { formatProduct } from "@/lib/product";

const NO_FILTER = { categoryId: "", brandIds: [], price: -1 }; // price = vị trí trong PRICE_RANGES, -1 là tất cả

function ProductsContent() {
  // URL: /products?q=hoa&category=hoa-sinh-nhat&sale=1
  const params = useSearchParams();
  const qParam = params.get("q") || params.get("search") || "";
  const categoryParam = params.get("category") || ""; // id hoặc slug
  const onlySale = params.get("sale") === "1";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // danh mục cha, mỗi cái có children
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(qParam); // ô tìm kiếm
  const [filters, setFilters] = useState(NO_FILTER); // danh mục, thương hiệu, giá
  const [showFilter, setShowFilter] = useState(false); // ngăn lọc trên điện thoại

  const change = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  const clear = () => setFilters(NO_FILTER);

  // 1. Gọi API 1 lần: sản phẩm + danh mục + thương hiệu
  useEffect(() => {
    Promise.all([getAllProducts(), getPublicCategories(), getBrands({ per_page: 100 })])
      .then(([p, c, b]) => {
        setProducts(p.map(formatProduct));
        setCategories(c);
        setBrands(b);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Mọi danh mục (cha + con) trong 1 mảng phẳng
  const allCategories = useMemo(() => categories.flatMap((c) => [c, ...(c.children || [])]), [categories]);

  // 2. Đồng bộ từ URL: từ khóa (header tìm kiếm) và danh mục (?category=id hoặc slug)
  useEffect(() => setKeyword(qParam), [qParam]);
  useEffect(() => {
    const found = allCategories.find((c) => String(c.id) === categoryParam || c.slug === categoryParam);
    change({ categoryId: found ? String(found.id) : categoryParam });
  }, [categoryParam, allCategories]);

  // 3. Lọc ở client: từ khóa, danh mục (gồm danh mục con), thương hiệu, khoảng giá
  const visible = useMemo(() => {
    const picked = categories.find((c) => String(c.id) === filters.categoryId);
    const categoryIds = (picked ? [picked, ...(picked.children || [])] : [{ id: filters.categoryId }]).map((c) => String(c.id));
    const range = PRICE_RANGES[filters.price]; // undefined nếu chưa chọn giá
    const kw = keyword.trim().toLowerCase();

    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(kw) &&
        (!filters.categoryId || categoryIds.includes(String(p.category_id))) &&
        (filters.brandIds.length === 0 || filters.brandIds.includes(String(p.brand_id))) &&
        (!range || (p.price >= range.min && p.price < range.max)) &&
        (!onlySale || p.originalPrice)
    );
  }, [products, categories, keyword, filters, onlySale]);

  const title = onlySale
    ? "Sản phẩm khuyến mãi"
    : allCategories.find((c) => String(c.id) === filters.categoryId)?.name || "Tất cả sản phẩm";
  const filterCount = (filters.categoryId ? 1 : 0) + filters.brandIds.length + (filters.price >= 0 ? 1 : 0);

  const sidebar = <FilterSidebar categories={categories} brands={brands} filters={filters} onChange={change} onClear={clear} />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tiêu đề */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 flex-shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-gray-500 text-sm mt-1">{visible.length} sản phẩm</p>
          </div>
        </div>

        {/* Ô tìm kiếm + nút bộ lọc (điện thoại) */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm sản phẩm theo tên..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
            />
            {keyword && (
              <button onClick={() => setKeyword("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="md:hidden flex items-center gap-2 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium"
          >
            <SlidersHorizontal size={16} /> Lọc
            {filterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{filterCount}</span>
            )}
          </button>
        </div>

        {showFilter && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilter(false)} />
            <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                  <span className="font-bold text-sm text-gray-800">Bộ lọc</span>
                  <button onClick={() => setShowFilter(false)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                {sidebar}
              </div>
              <div className="pt-4 mt-6 border-t border-gray-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowFilter(false)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Xem {visible.length} sản phẩm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">{sidebar}</div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <p className="text-center text-gray-500 py-16">Đang tải...</p>
            ) : visible.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Không có sản phẩm phù hợp</p>
                <button
                  onClick={() => {
                    clear();
                    setKeyword("");
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <ProductList products={visible} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// useSearchParams bắt buộc nằm trong Suspense (yêu cầu của Next.js)
export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-500 py-16">Đang tải...</p>}>
      <ProductsContent />
    </Suspense>
  );
}
