"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { createProduct, getNotParentCategories } from "@/services/productServices";

const generateSlug = (text: string) =>
    text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "-");

// Lấy mảng từ nhiều kiểu response của Laravel
const toList = (res: any): any[] =>
    Array.isArray(res) ? res
    : Array.isArray(res?.data) ? res.data
    : Array.isArray(res?.data?.data) ? res.data.data
    : [];

export default function CreateProductPage() {
    const router = useRouter();

    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [form, setForm] = useState({
        name: "",
        slug: "",
        category_id: "",
        brand_id: "",
        price: "",
        sale_price: "",
        qty: "0",
        description: "",
        status: "1",
    });
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Giải phóng ảnh xem trước khi đổi ảnh hoặc rời trang
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    // Lấy danh mục và thương hiệu cho 2 ô chọn
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                let list = toList(await getNotParentCategories());
                if (list.length === 0) {
                    const catFallback = await axiosClient.get("/categories");
                    list = toList(catFallback);
                }
                setCategories(list);
            } catch {
                try {
                    const catFallback = await axiosClient.get("/categories");
                    setCategories(toList(catFallback));
                } catch (err) {
                    console.error("Lỗi lấy danh mục:", err);
                }
            }

            try {
                setBrands(toList(await axiosClient.get("/brands")));
            } catch (err) {
                console.error("Lỗi lấy thương hiệu:", err);
            }
        };
        void fetchOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const type = (target as HTMLInputElement).type;

        if (type === "file") {
            const file = (target as HTMLInputElement).files?.[0];
            if (!file) return;
            setImage(file);
            if (preview) URL.revokeObjectURL(preview);
            setPreview(URL.createObjectURL(file));
            return;
        }

        setForm((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "name") updated.slug = generateSlug(value);
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) return setError("Vui lòng nhập tên sản phẩm");
        if (!form.category_id) return setError("Vui lòng chọn danh mục");
        if (form.price === "" || Number(form.price) < 0) return setError("Vui lòng nhập giá bán hợp lệ");
        if (form.sale_price !== "") {
            const numSale = Number(form.sale_price);
            const numPrice = Number(form.price);
            if (isNaN(numSale) || numSale < 0) {
                return setError("Giá sale không được âm và phải là số hợp lệ");
            }
            if (numSale >= numPrice) {
                return setError("Giá bán gốc phải cao hơn giá sale (giá sale phải nhỏ hơn giá bán gốc)");
            }
        }
        if (Number(form.qty) < 0) return setError("Số lượng không được âm");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name.trim());
            formData.append("slug", form.slug || generateSlug(form.name));
            formData.append("category_id", form.category_id);
            if (form.brand_id) formData.append("brand_id", form.brand_id);
            formData.append("price", form.price);
            if (form.sale_price) formData.append("sale_price", form.sale_price);
            formData.append("qty", form.qty || "0");
            formData.append("description", form.description || "");
            formData.append("status", form.status);
            if (image) formData.append("image", image);

            await createProduct(formData);
            alert("✅ Thêm sản phẩm thành công!");
            router.push("/admin/products?refresh=" + Date.now());
        } catch (err: any) {
            console.error("❌ Lỗi thêm sản phẩm:", err?.response?.data || err.message);
            const errors = err?.response?.data?.errors;
            const msg = errors
                ? (Object.values(errors)[0] as any)?.[0]
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
                <h1 className="text-3xl font-bold text-gray-800">Thêm Sản Phẩm</h1>
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
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên sản phẩm..."
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
                                    placeholder="ten-san-pham"
                                    className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                        Danh mục <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={handleChange}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                        Thương hiệu
                                    </label>
                                    <select
                                        name="brand_id"
                                        value={form.brand_id}
                                        onChange={handleChange}
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="">-- Không chọn --</option>
                                        {brands.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                        Giá bán (đ) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                        Giá Sale  (đ)
                                    </label>
                                    <input
                                        type="number"
                                        name="sale_price"
                                        min="0"
                                        value={form.sale_price}
                                        onChange={handleChange}
                                        placeholder="0 (nếu có)"
                                        className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                        Số lượng
                                    </label>
                                    <input
                                        type="number"
                                        name="qty"
                                        min="0"
                                        value={form.qty}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Chi tiết sản phẩm
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Nhập mô tả sản phẩm..."
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Hình ảnh
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 file:cursor-pointer cursor-pointer"
                                />
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="Xem trước"
                                        className="mt-4 w-32 h-32 object-cover rounded-xl border shadow-sm"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Trạng thái hiển thị
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="1">Hiển thị (Active)</option>
                                    <option value="0">Tạm ẩn (Hidden)</option>
                                </select>
                            </div>

                            <div className="pt-6 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push("/admin/products")}
                                    className="flex-1 h-12 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? "Đang xử lý..." : "💾 Lưu sản phẩm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
