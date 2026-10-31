"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, getCategories } from "@/services/categoryServices";
import { Upload, X, ArrowLeft, Layers } from "lucide-react";

export default function CreateCategoryPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [parentOptions, setParentOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [form, setForm] = useState({
        name: "",
        slug: "",
        status: "1",
        parent_id: "",
        is_featured: false,
    });

    const generateSlug = (text) => text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    // Dọn dẹp URL blob khi unmount
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    // Lấy danh sách danh mục để chọn danh mục cha
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = (await getCategories());
                let list = [];
                if (Array.isArray(res))
                    list = res;
                else if (Array.isArray(res?.data))
                    list = res.data;
                else if (Array.isArray(res?.data?.data))
                    list = res.data.data;
                else if (Array.isArray(res?.categories))
                    list = res.categories;
                // Danh mục cha = danh mục gốc (không có parent_id)
                const rootOnly = list.filter((item) => item.parent_id == null || Number(item.parent_id) === 0);
                setParentOptions(rootOnly);
            }
            catch (err) {
                console.error("Lỗi lấy danh mục cha:", err);
            }
        };
        void fetchCategories();
    }, []);

    const handleChange = (e) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const checked = target.checked;
        const type = target.type;
        if (name === "name") {
            setForm((prev) => ({ ...prev, name: value, slug: generateSlug(value) }));
            return;
        }
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(file);
        if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        setImage(null);
        setPreview("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name.trim()) {
            setError("Tên danh mục là bắt buộc");
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name.trim());
            formData.append("slug", form.slug || generateSlug(form.name));
            formData.append("status", form.status);
            formData.append("is_featured", form.is_featured ? "1" : "0");
            if (form.parent_id) {
                formData.append("parent_id", form.parent_id);
            }
            if (image) {
                formData.append("image", image);
            }

            await createCategory(formData);
            alert("✅ Thêm danh mục thành công!");
            router.push("/admin/category?refresh=" + Date.now());
        }
        catch (err) {
            console.error("❌ Lỗi:", err?.response?.data || err.message);
            const errors = err?.response?.data?.errors;
            const msg = errors
                ? Object.values(errors)[0]?.[0]
                : err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            setError(String(msg));
            alert("❌ " + msg);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full p-4 md:p-6 font-sans">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/category")}
                        className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition shadow-2xs cursor-pointer"
                        title="Quay lại danh sách"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Layers className="w-6 h-6 text-[#f68b1f]" />
                            <span>Thêm Danh Mục</span>
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Tạo danh mục mới và tải lên hình ảnh đại diện
                        </p>
                    </div>
                </div>
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
                                    placeholder="Ví dụ: Hoa Sinh Nhật, Lan Hồ Điệp..."
                                    className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-[#f68b1f]"
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
                                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-[#f68b1f]"
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
                            {/* Upload Hình ảnh */}
                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Hình ảnh danh mục
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition cursor-pointer text-xs font-medium">
                                        <Upload className="w-4 h-4 text-gray-500" />
                                        <span>Chọn ảnh đại diện</span>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/jpg"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {preview && (
                                        <div className="relative w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-xs">
                                            <img
                                                src={preview}
                                                alt="Xem trước"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-0 right-0 p-1 bg-rose-500 text-white rounded-bl hover:bg-rose-600 transition cursor-pointer"
                                                title="Gỡ ảnh"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    Hỗ trợ file: JPG, PNG, WEBP (Tối đa 2MB)
                                </p>
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Trạng thái hiển thị
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-[#f68b1f]"
                                >
                                    <option value="1">Hiển thị (Active)</option>
                                    <option value="0">Tạm ẩn (Hidden)</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer pt-2">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={form.is_featured}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-[#f68b1f]"
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
                                    className="flex-[2] h-12 rounded-xl bg-[#f68b1f] text-white font-bold hover:bg-[#e67300] shadow-lg shadow-orange-200 transition disabled:opacity-50 cursor-pointer"
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

