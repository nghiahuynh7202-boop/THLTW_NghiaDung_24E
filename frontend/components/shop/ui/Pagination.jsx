"use client";
import React from "react";
export default function Pagination({ currentPage, pageCount, onPageChange, }) {
    if (pageCount <= 1)
        return null;
    return (<div className="flex justify-center items-center gap-2 flex-wrap select-none">
      <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer">
        ← Trước
      </button>

      {Array.from({ length: pageCount }).map((_, i) => {
            const page = i + 1;
            const isActive = page === currentPage;
            return (<button key={page} onClick={() => onPageChange(page)} className={`w-10 h-10 rounded-lg border font-bold text-sm transition cursor-pointer ${isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
            {page}
          </button>);
        })}

      <button onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer">
        Sau →
      </button>
    </div>);
}
