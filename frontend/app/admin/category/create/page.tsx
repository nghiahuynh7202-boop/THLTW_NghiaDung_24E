"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, getCategories, CategoryItem } from "@/services/categoryServices";

export default function CreateCategoryPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [parentOptions, setParentOptions] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        slug: "",
        status: "1",
        parent_id: "",
        is_featured: false,
    });

    const generateSlug = (text: string) =>
        text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9 ]/g, "")
            .trim()
            .replace(/\s+/g, "-");

    // Lấy danh sách danh mục để chọn danh mục cha
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = (await getCategories()) as any;
                let list: CategoryItem[] = [];
                if (Array.isArray(res)) list = res;
                else if (Array.isArray(res?.data)) list = res.data;
                else if (Array.isArray(res?.data?.data)) list = res.data.data;
                else if (Array.isArray(res?.categories)) list = res.categories;

                // Danh mục cha = danh mục gốc (không có parent_id)
                const rootOnly = list.filter(
                    (item) => item.parent_id == null || Number(item.parent_id) === 0
                );
                setParentOptions(rootOnly);
            } catch (err) {
                console.error("Lỗi lấy danh mục cha:", err);
            }
        };
        void fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const checked = (target as HTMLInputElement).checked;
        const type = target.type;

        if (name === "name") {
            setForm((prev) => ({ ...prev, name: value, slug: generateSlug(value) }));
            return;
        }
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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

            await createCategory(data);
            alert("✅ Thêm danh mục thành công!");
            router.push("/admin/category?refresh=" + Date.now());
        } catch (err: any) {
            console.error("❌ Lỗi:", err?.response?.data || err.message);
            const errors = err?.response?.data?.errors;
            const msg = errors
                ? Object.values(errors)[0]?.[0]
                : err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            setError(String(msg));
            alert("❌ " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full p-4 md:p-6 font-sans">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Thêm Danh Mục</h1>
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
                                    placeholder="ten-danh-muc"
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
                                        <option key={item.id} value={item.id}>
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
                                    {loading ? "Đang xử lý..." : "💾 Lưu danh mục"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
