"use client";

// Dãy nút lọc danh mục
export default function TagList({ tags = [], active, onChange, baseClass, activeClass, idleClass }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tags.map((tag) => (
        <button
          key={tag.label}
          type="button"
          onClick={() => onChange(tag)}
          className={`${baseClass} ${active?.label === tag.label ? activeClass : idleClass}`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}