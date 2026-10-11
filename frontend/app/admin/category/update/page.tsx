"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategoryById, updateCategory, getCategories, CategoryItem } from "@/services/categoryServices";

const generateSlug = (text: string) =>
    text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "-");

function UpdateCategoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [parentOptions, setParentOptions] = useState<CategoryItem[]>([]);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        status: "1",
        parent_id: "",
        is_featured: false,
    });


    useEffect(() => {
        const fetchParents = async () => {
            try {
                const res = (await getCategories()) as any;
                let list: CategoryItem[] = [];
                if (Array.isArray(res)) list = res;
                else if (Array.isArray(res?.data)) list = res.data;
                else if (Array.isArray(res?.data?.data)) list = res.data.data;
                else if (Array.isArray(res?.categories)) list = res.categories;

                const rootOnly = list.filter(
                    (c) => (c.parent_id == null || Number(c.parent_id) === 0) && String(c.id) !== String(id)
                );
                setParentOptions(rootOnly);
            } catch (err) {
                console.error("Lỗi lấy danh mục cha:", err);
            }
        };
        void fetchParents();
    }, [id]);

    // Lấy dữ liệu danh mục cần sửa
    useEffect(() => {
        if (!id) {
            setError("Thiếu id danh mục");
            setFetching(false);
            return;
        }

        const fetchCategory = async () => {
            try {
                const res = (await getCategoryById(id)) as any;
                const c = res?.data?.data ?? res?.data ?? res;

                if (!c || !c.id) {
                    setError("Không tìm thấy danh mục");
                    return;
                }

                setForm({
                    name: c.name || "",
                    slug: c.slug || "",
                    status: String(c.status ?? "1"),
                    parent_id: c.parent_id ? String(c.parent_id) : "",
                    is_featured: Boolean(Number(c.is_featured)),
                });
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
                setError("Không thể tải dữ liệu danh mục");
            } finally {
                setFetching(false);
            }
        };
        void fetchCategory();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const checked = (target as HTMLInputElement).checked;
        const type = target.type;

        setForm((prev) => {
            const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
            if (name === "name") updated.slug = generateSlug(value);
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Tên danh mục là bắt buộc");
            return;
        }

        setLoading(true);
        try {
            const data = {
                name: form.name.trim(),
                slug: form.slug || generateSlug(form.name),
                status: Number(form.status),
                is_featured: form.is_featured ? 1 : 0,
                parent_id: form.parent_id ? Number(form.parent_id) : null,
            };

            await updateCategory(id!, data);
            alert("✅ Cập nhật danh mục thành công!");
            router.push("/admin/category?refresh=" + Date.now());
        } catch (err: any) {
            console.error("❌ Lỗi:", err?.response?.data || err.message);
            const errors = err?.response?.data?.errors;
            const msg = errors
                ? (Object.values(errors)[0] as any)?.[0]
                : err?.response?.data?.message || err?.message || "Lỗi server";
            setError(String(msg));
            alert("❌ " + msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-[300px] flex items-center justify-center text-gray-500">
                Đang tải dữ liệu danh mục...
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6 font-sans">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Sửa Danh Mục #{id}</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* CỘT TRÁI */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên danh mục..."
                                    className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Slug (Tự động)
                                </label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    readOnly
                                    className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Danh mục cha
                                </label>
                                <select
                                    name="parent_id"
                                    value={form.parent_id}
                                    onChange={handleChange}
                                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
                                >
                                    <option value="">-- Không có (là danh mục gốc) --</option>
                                    {parentOptions.map((item) => (
                                        <option key={item.id} value={String(item.id)}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* CỘT PHẢI */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Trạng thái hiển thị
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"
                                >
                                    <option value="1">Hiển thị (Active)</option>
                                    <option value="0">Tạm ẩn (Hidden)</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={form.is_featured}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-blue-600"
                                />
                                <span className="text-[15px] font-semibold text-gray-700">
                                    Danh mục nổi bật ⭐
                                </span>
                            </label>

                            <div className="pt-6 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push("/admin/category")}
                                    className="flex-1 h-12 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? "Đang xử lý..." : "💾 Cập nhật danh mục"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UpdateCategoryPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải...</div>}>
            <UpdateCategoryContent />
        </Suspense>
    );
}
