"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories } from "@/services/categoryServices";
import { getProductById, updateProduct } from "@/services/productServices";
function EditProductContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [form, setForm] = useState({
        product_name: "",
        slug: "",
        cat_id: "",
        price: "",
        qty: "",
        description: "",
        status: "1",
        sale: "0",
        sale_price: "",
        is_featured: "0",
    });
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    useEffect(() => {
        return () => {
            if (preview.startsWith("blob:"))
                URL.revokeObjectURL(preview);
        };
    }, [preview]);
    // Fetch categories
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
                else if (Array.isArray(res?.data?.categories))
                    list = res.data.categories;
                setCategories(list);
            }
            catch (err) {
                console.error("Lỗi lấy danh mục:", err);
                setCategories([]);
            }
        };
        void fetchCategories();
    }, []);
    // Fetch product
    useEffect(() => {
        if (!id)
            return;
        const fetchProduct = async () => {
            try {
                const res = (await getProductById(id));
                const p = res?.data?.data || res?.data || res;
                if (!p || !p.id) {
                    console.error("Không tìm thấy product");
                    return;
                }
                setForm({
                    product_name: p.name || p.product_name || "",
                    slug: p.slug || "",
                    cat_id: String(p.category_id || p.cat_id || ""),
                    price: String(p.price || ""),
                    qty: String(p.qty ?? "0"),
                    description: p.description || "",
                    status: String(p.status ?? "1"),
                    sale: p.sale_price && Number(p.sale_price) > 0 ? "1" : "0",
                    sale_price: p.sale_price && Number(p.sale_price) > 0 ? String(p.sale_price) : "",
                    is_featured: String(p.is_featured ?? "0"),
                });
                if (p.image) {
                    const imgUrl = String(p.image).startsWith("http")
                        ? p.image
                        : `${backendUrl}/storage/${String(p.image).replace(/^\/?storage\//, "")}`;
                    setPreview(imgUrl);
                }
            }
            catch (err) {
                console.error("Lỗi lấy sản phẩm:", err?.response?.data || err?.message);
            }
        };
        void fetchProduct();
    }, [id, backendUrl]);
    const generateSlug = (text) => text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9 ]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    const handleChange = (e) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;
        const checked = target.checked;
        const type = target.type;
        const finalValue = type === "checkbox" ? (checked ? "1" : "0") : value;
        setForm((prev) => {
            const updated = { ...prev, [name]: finalValue };
            if (name === "product_name")
                updated.slug = generateSlug(value);
            if (name === "sale" && !checked)
                updated.sale_price = "";
            return updated;
        });
    };
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (preview.startsWith("blob:"))
                URL.revokeObjectURL(preview);
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.product_name.trim() || !form.cat_id || form.price === "") {
            alert("⚠️ Vui lòng nhập tên sản phẩm, chọn danh mục và nhập giá bán hợp lệ");
            return;
        }
        const numPrice = Number(form.price);
        if (isNaN(numPrice) || numPrice < 0) {
            alert("⚠️ Giá bán không được âm và phải là số hợp lệ");
            return;
        }
        if (form.sale === "1" && form.sale_price !== "") {
            const numSale = Number(form.sale_price);
            if (isNaN(numSale) || numSale < 0) {
                alert("⚠️ Giá sale không được âm và phải là số hợp lệ");
                return;
            }
            if (numSale >= numPrice) {
                alert("⚠️ Giá bán gốc phải cao hơn giá sale (giá sale phải nhỏ hơn giá bán gốc)");
                return;
            }
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", form.product_name.trim());
            formData.append("product_name", form.product_name.trim());
            formData.append("slug", form.slug || generateSlug(form.product_name));
            formData.append("category_id", form.cat_id);
            formData.append("cat_id", form.cat_id);
            formData.append("price", form.price);
            formData.append("qty", form.qty || "0");
            formData.append("description", form.description || "");
            formData.append("status", form.status);
            formData.append("is_featured", form.is_featured || "0");
            formData.append("is_on_sale", form.sale);
            if (form.sale === "1" && form.sale_price) {
                formData.append("sale_price", form.sale_price);
            }
            if (image)
                formData.append("image", image);
            await updateProduct(id, formData);
            alert("✅ Cập nhật sản phẩm thành công!");
            router.push("/admin/products?refresh=" + Date.now());
        }
        catch (err) {
            console.error("❌ Lỗi cập nhật:", err?.response?.data || err.message);
            const errors = err?.response?.data?.errors;
            const msg = errors
                ? Object.values(errors)[0]?.[0]
                : err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            alert("❌ " + msg);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="w-full p-4 md:p-6 font-sans">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Sửa Sản Phẩm #{id}</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* CỘT TRÁI */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </label>
                                <input type="text" name="product_name" value={form.product_name} onChange={handleChange} placeholder="Nhập tên sản phẩm..." className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-blue-500"/>
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">Slug (Tự động)</label>
                                <input type="text" value={form.slug} readOnly className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-500 outline-none"/>
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">
                                    Danh mục <span className="text-red-500">*</span>
                                </label>
                                <select name="cat_id" value={form.cat_id} onChange={handleChange} className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500 cursor-pointer">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((item) => (<option key={item.id} value={item.id}>
                                            {item.name || item.category_name}
                                        </option>))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">Giá bán (đ)</label>
                                    <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0" className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-blue-500"/>
                                </div>
                                <div>
                                    <label className="block text-[15px] font-semibold text-gray-700 mb-2">Số lượng</label>
                                    <input type="number" name="qty" value={form.qty} onChange={handleChange} placeholder="0" className="w-full h-12 rounded-xl border border-gray-200 px-4 outline-none focus:border-blue-500"/>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">Hình ảnh</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded-xl border border-gray-200 px-4 py-2 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 file:cursor-pointer cursor-pointer"/>
                                {preview && (<img src={preview} alt="Preview" className="mt-4 w-32 h-32 object-cover rounded-xl border shadow-sm"/>)}
                            </div>
                        </div>

                        {/* CỘT PHẢI */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">Chi tiết sản phẩm</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={6} placeholder="Nhập mô tả sản phẩm..." className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 resize-none"/>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <label className="inline-flex items-center gap-3 text-[15px] font-semibold text-gray-700 cursor-pointer">
                                    <input type="checkbox" name="sale" checked={form.sale === "1"} onChange={handleChange} className="h-5 w-5 rounded accent-blue-600 cursor-pointer"/>
                                    Giảm giá
                                </label>
                                {form.sale === "1" && (<div className="mt-3">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Giá sau giảm (đ)</label>
                                        <input type="number" name="sale_price" value={form.sale_price} onChange={handleChange} placeholder="Nhập giá đã giảm..." className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500"/>
                                    </div>)}
                            </div>

                            {/* CHỨC NĂNG SẢN PHẨM NỔI BẬT: Admin cập nhật bật/tắt `is_featured` */}
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <label className="inline-flex items-center gap-3 text-[15px] font-semibold text-gray-700 cursor-pointer">
                                    <input type="checkbox" name="is_featured" checked={form.is_featured === "1"} onChange={handleChange} className="h-5 w-5 rounded accent-blue-600 cursor-pointer"/>
                                    Sản phẩm nổi bật
                                </label>
                                {form.is_featured === "1" && (
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                        ⭐ Nổi bật
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-gray-700 mb-2">Trạng thái hiển thị</label>
                                <select name="status" value={form.status} onChange={handleChange} className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-blue-500 cursor-pointer">
                                    <option value="1">Hiển thị (Active)</option>
                                    <option value="0">Tạm ẩn (Hidden)</option>
                                </select>
                            </div>

                            <div className="pt-6 flex items-center gap-4">
                                <button type="button" onClick={() => router.push("/admin/products")} className="flex-1 h-12 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={loading} className="flex-[2] h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 cursor-pointer">
                                    {loading ? "Đang xử lý..." : "💾 Cập nhật sản phẩm"}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>);
}
export default function EditProductPage() {
    return (<Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải...</div>}>
            <EditProductContent />
        </Suspense>);
}
