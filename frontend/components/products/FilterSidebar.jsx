"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Tag,
  Award,
  Layers,
  Check,
} from "lucide-react";

export const PRICE_RANGES = [
  { label: "Dưới 200.000đ", min: 0, max: 200000 },
  { label: "200.000đ – 500.000đ", min: 200000, max: 500000 },
  { label: "500.000đ – 1.000.000đ", min: 500000, max: 1000000 },
  { label: "Trên 1.000.000đ", min: 1000000, max: Infinity },
];

export default function FilterSidebar({
  categories = [],
  brands = [],
  filters = { categoryId: "", brandIds: [], price: -1 },
  onChange,
  onClear,
}) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  // Tự động mở rộng danh mục cha nếu có danh mục con hoặc chính nó đang được chọn
  useEffect(() => {
    if (!filters.categoryId || !categories.length) return;
    const catIdStr = String(filters.categoryId);

    const isParent = categories.some((c) => String(c.id) === catIdStr);
    if (isParent) {
      setExpandedIds((prev) => new Set([...prev, catIdStr]));
      return;
    }

    for (const parent of categories) {
      if (parent.children?.some((child) => String(child.id) === catIdStr)) {
        setExpandedIds((prev) => new Set([...prev, String(parent.id)]));
        break;
      }
    }
  }, [filters.categoryId, categories]);

  // Xử lý bấm danh mục cha:
  // - Bấm lần đầu: chọn nó (lọc luôn cả sản phẩm của các con) và mở danh sách con
  // - Bấm lần nữa: thu lại và bỏ chọn
  const handleParentClick = (parent) => {
    const parentId = String(parent.id);
    const hasChildren = parent.children && parent.children.length > 0;
    const isSelected = String(filters.categoryId) === parentId;
    const isExpanded = expandedIds.has(parentId);

    if (isSelected && isExpanded) {
      // Bấm lần nữa thì thu lại
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
      onChange?.({ categoryId: "" });
    } else {
      if (hasChildren) {
        setExpandedIds((prev) => new Set([...prev, parentId]));
      }
      onChange?.({ categoryId: parentId });
    }
  };

  // Nút mũi tên mở/thu danh mục con độc lập
  const toggleExpand = (e, parentId) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  // Bấm danh mục con: chỉ lọc con đó
  const handleChildClick = (child) => {
    const childId = String(child.id);
    if (String(filters.categoryId) === childId) {
      onChange?.({ categoryId: "" });
    } else {
      onChange?.({ categoryId: childId });
    }
  };

  // Thương hiệu: tick nhiều thương hiệu cùng lúc
  const handleBrandToggle = (brandId) => {
    const idStr = String(brandId);
    const exists = filters.brandIds.includes(idStr);
    const nextBrandIds = exists
      ? filters.brandIds.filter((id) => id !== idStr)
      : [...filters.brandIds, idStr];
    onChange?.({ brandIds: nextBrandIds });
  };

  // Khoảng giá: chọn 1 trong 4 mức, bấm lại thì hủy lọc
  const handlePriceSelect = (index) => {
    if (filters.price === index) {
      onChange?.({ price: -1 });
    } else {
      onChange?.({ price: index });
    }
  };

  const hasFilterActive =
    Boolean(filters.categoryId) ||
    filters.brandIds.length > 0 ||
    filters.price >= 0;

  return (
    <div className="space-y-6 text-sm">
      {/* Header bộ lọc & Nút xóa tất cả */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">
          Bộ lọc tìm kiếm
        </h3>
        {hasFilterActive && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>

      {/* 1. DANH MỤC */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Danh mục hoa</span>
          </label>
        </div>

        <div className="space-y-1">
          {/* Nút tất cả danh mục */}
          <button
            type="button"
            onClick={() => onChange?.({ categoryId: "" })}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
              !filters.categoryId
                ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span>Tất cả danh mục</span>
            {!filters.categoryId && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          {/* Danh sách danh mục cha và con */}
          {categories.map((parent) => {
            const parentId = String(parent.id);
            const isParentSelected = String(filters.categoryId) === parentId;
            const hasChildren = parent.children && parent.children.length > 0;
            const isExpanded = expandedIds.has(parentId);

            // Kiểm tra xem có con nào của parent đang được chọn không
            const isChildSelected =
              hasChildren &&
              parent.children.some(
                (child) => String(child.id) === String(filters.categoryId)
              );

            return (
              <div key={parent.id} className="rounded-xl overflow-hidden">
                {/* Hàng danh mục cha */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                    isParentSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : isChildSelected
                      ? "bg-blue-50/60 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100/70"
                  }`}
                  onClick={() => handleParentClick(parent)}
                >
                  <span className="truncate flex-1 pr-1">{parent.name}</span>

                  {hasChildren && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(e, parentId)}
                      className={`p-1 rounded-md transition hover:bg-black/10 ${
                        isParentSelected ? "text-white" : "text-gray-400"
                      }`}
                      title={isExpanded ? "Thu lại" : "Mở rộng danh mục con"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Danh sách con xổ ra */}
                {hasChildren && isExpanded && (
                  <div className="ml-3 pl-2.5 my-1 border-l-2 border-blue-200 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {parent.children.map((child) => {
                      const childId = String(child.id);
                      const isSelected = String(filters.categoryId) === childId;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleChildClick(child)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition text-left cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white font-bold shadow-xs"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <span className="truncate">{child.name}</span>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white ml-1 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. THƯƠNG HIỆU (Tick nhiều thương hiệu cùng lúc) */}
      {brands.length > 0 && (
        <div className="border-t border-gray-100 pt-5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Thương hiệu</span>
            {filters.brandIds.length > 0 && (
              <span className="ml-auto text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                {filters.brandIds.length} đã chọn
              </span>
            )}
          </label>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {brands.map((b) => {
              const bId = String(b.id);
              const isChecked = filters.brandIds.includes(bId);

              return (
                <label
                  key={b.id}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition ${
                    isChecked
                      ? "bg-blue-50/70 text-blue-900 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(b.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="truncate flex-1">{b.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. KHOẢNG GIÁ (Dưới 200k, 200k–500k, 500k–1 triệu, trên 1 triệu) */}
      <div className="border-t border-gray-100 pt-5">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span>Khoảng giá thực tế</span>
        </label>

        <div className="space-y-1.5">
          {PRICE_RANGES.map((range, index) => {
            const isSelected = filters.price === index;

            return (
              <label
                key={index}
                onClick={() => handlePriceSelect(index)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs cursor-pointer select-none transition ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="price_range"
                  checked={isSelected}
                  onChange={() => {}} // handled by label onClick
                  className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="flex-1">{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
