"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getStockDocuments,
  getStockDocumentById,
  createStockDocument,
  deleteStockDocument,
  getSuppliers,
} from "@/services/stockServices";
import { getAdminProducts } from "@/services/productServices";
import {
  Warehouse,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  X,
  Package,
  Calendar,
  User,
  Building,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import API_CONFIG from "@/config/api";

// Xử lý link ảnh sản phẩm
function resolveImgUrl(img) {
  if (!img) return "";
  const s = String(img).trim();
  if (s.startsWith("http") || s.startsWith("blob:")) return s;
  const clean = s.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  return `${API_CONFIG.ROOT_URL}/storage/${clean}`;
}

export default function StockManagementPage() {
  // Tab hiện tại: "history" (Lịch sử nhập xuất) hoặc "inventory" (Tồn kho sản phẩm)
  const [activeTab, setActiveTab] = useState("history");

  // Dữ liệu phiếu kho
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [docSearch, setDocSearch] = useState("");

  // Dữ liệu sản phẩm (cho Tab tồn kho và dropdown chọn khi lập phiếu)
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [prodSearch, setProdSearch] = useState("");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");

  // Dữ liệu nhà cung cấp
  const [suppliers, setSuppliers] = useState([]);

  // Modal tạo phiếu (null, 'in', hoặc 'out')
  const [modalType, setModalType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formSupplierId, setFormSupplierId] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formItems, setFormItems] = useState([
    { product_id: "", qty: 1, unit_cost: 0 },
  ]);

  // Modal xem chi tiết phiếu
  const [detailDoc, setDetailDoc] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Tải danh sách phiếu kho
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await getStockDocuments({ per_page: 100 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      setDocuments(list);
    } catch (err) {
      console.error("Lỗi lấy danh sách phiếu kho:", err);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  // 2. Tải danh sách sản phẩm
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await getAdminProducts({ per_page: 100 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      setProducts(list);
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 3. Tải danh sách nhà cung cấp
  const fetchSuppliers = async () => {
    try {
      const list = await getSuppliers({ per_page: 50 });
      setSuppliers(Array.isArray(list) ? list : []);
    } catch {
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchProducts();
    fetchSuppliers();
  }, []);

  // 4. Lọc phiếu kho
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (typeFilter !== "all" && doc.type !== typeFilter) return false;
      if (docSearch.trim()) {
        const kw = docSearch.toLowerCase();
        const matchCode = doc.code?.toLowerCase().includes(kw);
        const matchReason = doc.reason?.toLowerCase().includes(kw);
        const matchSupplier = doc.supplier?.name?.toLowerCase().includes(kw);
        return matchCode || matchReason || matchSupplier;
      }
      return true;
    });
  }, [documents, typeFilter, docSearch]);

  // 5. Lọc tồn kho sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const qty = Number(p.qty) || 0;
      if (stockLevelFilter === "in_stock" && qty <= 10) return false;
      if (stockLevelFilter === "low_stock" && (qty <= 0 || qty > 10)) return false;
      if (stockLevelFilter === "out_of_stock" && qty > 0) return false;

      if (prodSearch.trim()) {
        const kw = prodSearch.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(kw);
        const matchCategory = p.category?.name?.toLowerCase().includes(kw);
        return matchName || matchCategory;
      }
      return true;
    });
  }, [products, stockLevelFilter, prodSearch]);

  // 6. Xử lý mở Modal tạo phiếu
  const handleOpenCreateModal = (type, defaultProductId = null) => {
    setModalType(type);
    setFormSupplierId(suppliers[0]?.id ? String(suppliers[0].id) : "");
    setFormReason(
      type === "in"
        ? "Nhập hàng định kỳ từ nhà cung cấp"
        : "Xuất hủy hoa hỏng / lỗi"
    );
    setFormNote("");
    setFormItems([
      {
        product_id: defaultProductId ? String(defaultProductId) : (products[0]?.id ? String(products[0].id) : ""),
        qty: 1,
        unit_cost: 0,
      },
    ]);
  };

  // Thêm dòng sản phẩm trong form
  const handleAddItemRow = () => {
    setFormItems((prev) => [
      ...prev,
      {
        product_id: products[0]?.id ? String(products[0].id) : "",
        qty: 1,
        unit_cost: 0,
      },
    ]);
  };

  // Xóa dòng sản phẩm trong form
  const handleRemoveItemRow = (idx) => {
    if (formItems.length === 1) {
      alert("Phiếu phải có ít nhất 1 sản phẩm!");
      return;
    }
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Cập nhật giá trị dòng sản phẩm
  const handleItemChange = (idx, field, value) => {
    setFormItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  // 7. Gửi form tạo phiếu kho
  const handleSubmitDocument = async (e) => {
    e.preventDefault();

    if (formItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    // Kiểm tra số lượng hợp lệ
    for (const item of formItems) {
      if (!item.product_id) {
        alert("Vui lòng chọn sản phẩm cho tất cả các dòng!");
        return;
      }
      if (Number(item.qty) <= 0) {
        alert("Số lượng phải lớn hơn 0!");
        return;
      }

      // Nếu xuất kho, kiểm tra tồn kho
      if (modalType === "out") {
        const prod = products.find((p) => String(p.id) === String(item.product_id));
        const currentQty = Number(prod?.qty) || 0;
        if (Number(item.qty) > currentQty) {
          alert(`Sản phẩm "${prod?.name || "này"}" chỉ còn ${currentQty} trong kho, không thể xuất ${item.qty}!`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        type: modalType,
        reason: formReason.trim(),
        supplier_id: formSupplierId ? Number(formSupplierId) : null,
        note: formNote ? formNote.trim() : null,
        items: formItems.map((it) => ({
          product_id: Number(it.product_id),
          qty: Number(it.qty),
          unit_cost: modalType === "in" ? Number(it.unit_cost) || 0 : 0,
        })),
      };

      await createStockDocument(payload);
      alert(modalType === "in" ? "✅ Đã tạo phiếu nhập kho & tăng tồn kho thành công!" : "✅ Đã tạo phiếu xuất kho & trừ tồn kho thành công!");
      setModalType(null);
      fetchDocuments();
      fetchProducts();
    } catch (err) {
      console.error("Lỗi tạo phiếu kho:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi tạo phiếu kho";
      alert("❌ " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 8. Xem chi tiết phiếu
  const handleViewDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const data = await getStockDocumentById(id);
      setDetailDoc(data);
    } catch (err) {
      console.error("Lỗi lấy chi tiết phiếu:", err);
      alert("Không thể tải chi tiết phiếu kho!");
    } finally {
      setLoadingDetail(false);
    }
  };

  // 9. Xóa phiếu kho
  const handleDeleteDoc = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn chuyển phiếu kho này vào thùng rác?")) return;
    try {
      await deleteStockDocument(id);
      alert("✅ Đã chuyển phiếu kho vào thùng rác!");
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("❌ Xóa phiếu kho thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-[#f68b1f]" />
              <span>Quản lý Kho (Nhập / Xuất Hàng)</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Ghi nhận phiếu nhập/xuất kho, cập nhật và theo dõi số lượng tồn kho sản phẩm
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Nút Tạo phiếu nhập (xanh lá) */}
            <button
              onClick={() => handleOpenCreateModal("in")}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Tạo phiếu nhập</span>
            </button>

            {/* Nút Tạo phiếu xuất (đỏ cam) */}
            <button
              onClick={() => handleOpenCreateModal("out")}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Tạo phiếu xuất</span>
            </button>

            {/* Nút làm mới */}
            <button
              onClick={() => {
                fetchDocuments();
                fetchProducts();
              }}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDocs || loadingProducts ? "animate-spin text-[#f68b1f]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Thanh chuyển đổi Tab */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === "history"
                ? "border-[#f68b1f] text-[#f68b1f] bg-white shadow-xs"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Lịch sử phiếu nhập / xuất ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
              activeTab === "inventory"
                ? "border-[#f68b1f] text-[#f68b1f] bg-white shadow-xs"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Tồn kho sản phẩm hiện tại ({products.length})
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: LỊCH SỬ PHIẾU NHẬP / XUẤT KHO                       */}
        {/* ========================================================= */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {/* Bộ lọc & Tìm kiếm */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">Danh sách phiếu kho</span>
                <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {filteredDocuments.length}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Tìm kiếm */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Tìm mã phiếu, lý do..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] w-48 sm:w-60"
                  />
                </div>

                {/* Lọc loại phiếu */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="py-1.5 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white text-gray-600"
                >
                  <option value="all">Tất cả loại phiếu</option>
                  <option value="in">Phiếu nhập kho (IN)</option>
                  <option value="out">Phiếu xuất kho (OUT)</option>
                </select>
              </div>
            </div>

            {/* Bảng dữ liệu phiếu kho */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 text-center w-12">STT</th>
                    <th className="py-3 px-4">Mã phiếu</th>
                    <th className="py-3 px-4">Loại phiếu</th>
                    <th className="py-3 px-4">Lý do / Nhà cung cấp</th>
                    <th className="py-3 px-4">Người lập</th>
                    <th className="py-3 px-4 text-center">Số mặt hàng</th>
                    <th className="py-3 px-4 text-center">Ngày tạo</th>
                    <th className="py-3 px-4 text-center w-28">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingDocs ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                          <span>Đang tải danh sách phiếu kho...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc, idx) => {
                      const isImport = doc.type === "in";
                      const totalQty = (doc.items || []).reduce((sum, it) => sum + (Number(it.qty) || 0), 0);

                      return (
                        <tr key={doc.id} className="hover:bg-orange-50/20 transition-colors">
                          <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-gray-800">
                            {doc.code}
                          </td>
                          <td className="py-3.5 px-4">
                            {isImport ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                                <ArrowDownRight className="w-3 h-3" />
                                Nhập kho
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                                <ArrowUpRight className="w-3 h-3" />
                                Xuất kho
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-gray-800">{doc.reason || "—"}</div>
                            {doc.supplier?.name && (
                              <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-gray-400" />
                                <span>NCC: {doc.supplier.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {doc.creator?.name || "Admin"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-semibold text-gray-800">
                              {(doc.items || []).length}
                            </span>{" "}
                            <span className="text-gray-400 text-[11px]">
                              ({totalQty} cái)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-gray-500 text-[11px]">
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleViewDetail(doc.id)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md transition cursor-pointer"
                                title="Xem chi tiết phiếu"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-md transition cursor-pointer"
                                title="Xóa phiếu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-400">
                        <Warehouse className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-xs font-medium text-gray-500">Chưa có phiếu kho nào</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BÁO CÁO TỒN KHO SẢN PHẨM HIỆN TẠI                   */}
        {/* ========================================================= */}
        {activeTab === "inventory" && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            {/* Bộ lọc & Tìm kiếm sản phẩm */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">Tồn kho sản phẩm</span>
                <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {filteredProducts.length}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Tìm kiếm */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    placeholder="Tìm tên hoa, danh mục..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] w-48 sm:w-60"
                  />
                </div>

                {/* Lọc theo mức tồn kho */}
                <select
                  value={stockLevelFilter}
                  onChange={(e) => setStockLevelFilter(e.target.value)}
                  className="py-1.5 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white text-gray-600"
                >
                  <option value="all">Tất cả mức tồn</option>
                  <option value="in_stock">Còn nhiều ({">"}10)</option>
                  <option value="low_stock">Sắp hết hàng (1 - 10)</option>
                  <option value="out_of_stock">Đã hết hàng (0)</option>
                </select>
              </div>
            </div>

            {/* Bảng tồn kho */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 text-center w-12">STT</th>
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4">Danh mục / Thương hiệu</th>
                    <th className="py-3 px-4 text-right">Giá bán</th>
                    <th className="py-3 px-4 text-center">Tồn kho hiện tại</th>
                    <th className="py-3 px-4 text-center">Tình trạng</th>
                    <th className="py-3 px-4 text-center w-28">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                          <span>Đang tải danh sách tồn kho...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((prod, idx) => {
                      const qty = Number(prod.qty) || 0;
                      const imgUrl = resolveImgUrl(prod.image);

                      return (
                        <tr key={prod.id} className="hover:bg-orange-50/20 transition-colors">
                          <td className="py-3 px-4 text-center text-gray-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shrink-0 flex items-center justify-center">
                                {imgUrl ? (
                                  <img src={imgUrl} alt={prod.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-gray-300" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800 text-xs">{prod.name}</div>
                                <div className="text-[11px] text-gray-400 font-mono">ID: #{prod.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <div>{prod.category?.name || "Chưa phân loại"}</div>
                            {prod.brand?.name && (
                              <div className="text-[11px] text-gray-400">{prod.brand.name}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-800">
                            {Number(prod.price || 0).toLocaleString("vi-VN")} đ
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-sm text-gray-800">{qty}</span>
                            <span className="text-[11px] text-gray-400 ml-1">cái</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {qty > 10 ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Còn hàng
                              </span>
                            ) : qty > 0 ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                Sắp hết
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                                Hết hàng
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenCreateModal("in", prod.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-[#f68b1f] hover:bg-orange-50 border border-orange-200 rounded-md transition cursor-pointer"
                            >
                              + Nhập thêm
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-400">
                        <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-xs font-medium text-gray-500">Không tìm thấy sản phẩm nào</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: TẠO PHIẾU NHẬP / XUẤT KHO                         */}
        {/* ========================================================= */}
        {modalType && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Tiêu đề modal */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  {modalType === "in" ? (
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <ArrowDownRight className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-gray-800">
                      {modalType === "in" ? "Lập Phiếu Nhập Kho Hàng" : "Lập Phiếu Xuất Kho Hàng"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {modalType === "in"
                        ? "Ghi nhận nhập hàng mới và tự động tăng tồn kho sản phẩm"
                        : "Xuất trả nhà cung cấp hoặc xuất hủy hàng hỏng/lỗi và tự động trừ tồn kho"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nội dung form */}
              <form onSubmit={handleSubmitDocument} className="p-6 overflow-y-auto space-y-5 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chọn nhà cung cấp (khi nhập hàng hoặc khi xuất trả NCC) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nhà cung cấp {modalType === "out" ? "(Nếu xuất trả NCC)" : "(Tùy chọn)"}
                    </label>
                    <select
                      value={formSupplierId}
                      onChange={(e) => setFormSupplierId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white"
                    >
                      <option value="">-- Không chọn / Không có --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.phone || "Không SĐT"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lý do nhập / xuất */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Lý do {modalType === "in" ? "nhập" : "xuất"} kho <span className="text-red-500">*</span>
                    </label>
                    {modalType === "in" ? (
                      <input
                        type="text"
                        required
                        value={formReason}
                        onChange={(e) => setFormReason(e.target.value)}
                        placeholder="Ví dụ: Nhập hàng đợt 1 từ nhà cung cấp"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f]"
                      />
                    ) : (
                      <select
                        value={formReason}
                        onChange={(e) => setFormReason(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white"
                      >
                        <option value="Xuất trả nhà cung cấp (hàng lỗi/kém chất lượng)">Xuất trả nhà cung cấp (hàng lỗi/kém chất lượng)</option>
                        <option value="Xuất hủy hoa hỏng / lỗi / héo úa">Xuất hủy hoa hỏng, dập nát, héo úa</option>
                        <option value="Xuất mẫu trưng bày / quảng cáo">Xuất mẫu trưng bày / chụp hình quảng cáo</option>
                        <option value="Xuất cân đối kiểm kê hao hụt">Xuất cân đối kiểm kê hao hụt</option>
                        <option value="Xuất kho lý do khác">Xuất kho lý do khác</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ghi chú thêm
                  </label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder="Ghi chú chi tiết nếu có..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f]"
                  />
                </div>

                {/* Danh sách mặt hàng trong phiếu */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Chi tiết mặt hàng ({formItems.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#f68b1f] hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm sản phẩm
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {formItems.map((item, idx) => {
                      const selectedProd = products.find((p) => String(p.id) === String(item.product_id));
                      const stockQty = Number(selectedProd?.qty) || 0;

                      return (
                        <div key={idx} className="p-3 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center gap-3">
                          {/* Chọn sản phẩm */}
                          <div className="flex-1">
                            <label className="block text-[11px] text-gray-500 mb-0.5">Sản phẩm</label>
                            <select
                              required
                              value={item.product_id}
                              onChange={(e) => handleItemChange(idx, "product_id", e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white"
                            >
                              <option value="">-- Chọn hoa / sản phẩm --</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (Tồn kho: {p.qty || 0})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Số lượng */}
                          <div className="w-24">
                            <label className="block text-[11px] text-gray-500 mb-0.5">
                              Số lượng {modalType === "out" && `(Tối đa ${stockQty})`}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={modalType === "out" ? stockQty : undefined}
                              required
                              value={item.qty}
                              onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f]"
                            />
                          </div>

                          {/* Đơn giá nhập (chỉ hiện khi nhập kho) */}
                          {modalType === "in" && (
                            <div className="w-32">
                              <label className="block text-[11px] text-gray-500 mb-0.5">Đơn giá nhập (đ)</label>
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                value={item.unit_cost}
                                onChange={(e) => handleItemChange(idx, "unit_cost", e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#f68b1f]"
                              />
                            </div>
                          )}

                          {/* Nút xóa dòng */}
                          <div className="pt-4 sm:pt-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Xóa dòng này"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer nút hành động */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex items-center gap-1.5 text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50 ${
                      modalType === "in" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {submitting ? "Đang xử lý..." : modalType === "in" ? "Xác nhận nhập kho" : "Xác nhận xuất kho"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: XEM CHI TIẾT PHIẾU KHO                            */}
        {/* ========================================================= */}
        {detailDoc && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl ${
                      detailDoc.type === "in" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {detailDoc.type === "in" ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-800">
                      Chi Tiết Phiếu: {detailDoc.code}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {detailDoc.type === "in" ? "Phiếu nhập hàng vào kho" : "Phiếu xuất hàng khỏi kho"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailDoc(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Thông tin phiếu */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Lý do:</span>
                    <span className="font-semibold text-gray-800">{detailDoc.reason || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Nhà cung cấp:</span>
                    <span className="font-semibold text-gray-800">{detailDoc.supplier?.name || "Không có"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Người lập phiếu:</span>
                    <span className="font-semibold text-gray-800">{detailDoc.creator?.name || "Admin"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Thời gian tạo:</span>
                    <span className="font-semibold text-gray-800">
                      {detailDoc.created_at ? new Date(detailDoc.created_at).toLocaleString("vi-VN") : "—"}
                    </span>
                  </div>
                  {detailDoc.note && (
                    <div className="col-span-2 pt-1 border-t border-gray-200">
                      <span className="text-gray-400 block mb-0.5">Ghi chú:</span>
                      <span className="text-gray-700 italic">{detailDoc.note}</span>
                    </div>
                  )}
                </div>

                {/* Bảng danh sách mặt hàng */}
                <div>
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Danh sách mặt hàng
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Sản phẩm</th>
                          <th className="py-2.5 px-3 text-center">Số lượng</th>
                          {detailDoc.type === "in" && (
                            <>
                              <th className="py-2.5 px-3 text-right">Đơn giá nhập</th>
                              <th className="py-2.5 px-3 text-right">Thành tiền</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(detailDoc.items || []).map((it, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-medium text-gray-800">
                              {it.product?.name || `Sản phẩm #${it.product_id}`}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                              {it.qty}
                            </td>
                            {detailDoc.type === "in" && (
                              <>
                                <td className="py-2.5 px-3 text-right text-gray-600">
                                  {Number(it.unit_cost || 0).toLocaleString("vi-VN")} đ
                                </td>
                                <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                                  {(Number(it.qty) * Number(it.unit_cost || 0)).toLocaleString("vi-VN")} đ
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-gray-100 flex justify-end bg-gray-50/50">
                <button
                  onClick={() => setDetailDoc(null)}
                  className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
