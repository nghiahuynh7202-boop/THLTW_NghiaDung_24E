"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/supplierServices";
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  X,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State Modal Thêm / Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    status: 1,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // 1. Tải danh sách nhà cung cấp từ API
  const fetchSuppliersList = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers({ per_page: 100 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      setSuppliers(list);
    } catch (error) {
      console.error("Lỗi tải danh sách nhà cung cấp:", error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliersList();
  }, []);

  // 2. Lọc danh sách nhà cung cấp
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((item) => {
      if (statusFilter !== "all" && String(item.status) !== String(statusFilter)) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(term);
        const matchPhone = item.phone?.toLowerCase().includes(term);
        const matchAddress = item.address?.toLowerCase().includes(term);
        return matchName || matchPhone || matchAddress;
      }
      return true;
    });
  }, [suppliers, statusFilter, searchTerm]);

  // 3. Phân trang
  const pageCount = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const currentSuppliers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSuppliers.slice(start, start + itemsPerPage);
  }, [filteredSuppliers, currentPage]);

  // 4. Mở modal thêm mới
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      status: 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // 5. Mở modal chỉnh sửa
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      phone: item.phone || "",
      address: item.address || "",
      status: item.status ?? 1,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // 6. Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError("");
  };

  // 7. Gửi form (Thêm hoặc Sửa)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên nhà cung cấp.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");
    try {
      if (editingItem) {
        // Cập nhật
        await updateSupplier(editingItem.id, formData);
        alert("✅ Cập nhật nhà cung cấp thành công!");
      } else {
        // Thêm mới
        await createSupplier(formData);
        alert("✅ Thêm nhà cung cấp mới thành công!");
      }
      handleCloseModal();
      fetchSuppliersList();
    } catch (err) {
      console.error("Lỗi lưu nhà cung cấp:", err);
      const msg =
        err?.response?.data?.message ||
        "Lưu nhà cung cấp thất bại, vui lòng kiểm tra lại!";
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // 8. Chuyển nhà cung cấp vào thùng rác
  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn chuyển nhà cung cấp này vào thùng rác?")) {
      return;
    }

    try {
      await deleteSupplier(id);
      alert("✅ Đã chuyển nhà cung cấp vào thùng rác!");
      setSuppliers((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Lỗi xóa nhà cung cấp:", err);
      alert("❌ Xóa thất bại, vui lòng thử lại!");
    }
  };

  // Thống kê nhanh
  const totalCount = suppliers.length;
  const activeCount = suppliers.filter((s) => s.status === 1).length;
  const pausedCount = suppliers.filter((s) => s.status === 0).length;

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Truck className="w-6 h-6 text-[#f68b1f]" />
              <span>Quản lý Nhà cung cấp</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý danh sách đối tác cung cấp hoa tươi, phụ liệu & sản phẩm cho cửa hàng
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/suppliers/trash"
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Thùng rác</span>
            </Link>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 bg-[#f68b1f] hover:bg-[#e67300] text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nhà cung cấp</span>
            </button>
          </div>
        </div>

        {/* Thanh thống kê nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Tổng nhà cung cấp</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#f68b1f]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Đang hoạt động</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Tạm ngừng hợp tác</p>
              <p className="text-xl font-bold text-gray-500 mt-1">{pausedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm & lọc */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, địa chỉ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] bg-white cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Tạm ngừng</option>
            </select>

            <button
              onClick={fetchSuppliersList}
              className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-500 transition cursor-pointer"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Bảng danh sách nhà cung cấp */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[200px]">Tên nhà cung cấp</th>
                  <th className="py-3 px-4 min-w-[140px]">Số điện thoại</th>
                  <th className="py-3 px-4 min-w-[220px]">Địa chỉ</th>
                  <th className="py-3 px-4 w-32 text-center">Trạng thái</th>
                  <th className="py-3 px-4 w-28 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#f68b1f]" />
                      <span>Đang tải dữ liệu nhà cung cấp...</span>
                    </td>
                  </tr>
                ) : currentSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>Không tìm thấy nhà cung cấp nào phù hợp.</p>
                    </td>
                  </tr>
                ) : (
                  currentSuppliers.map((supplier, idx) => {
                    const stt = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr key={supplier.id} className="hover:bg-amber-50/30 transition">
                        <td className="py-3 px-4 text-center font-medium text-gray-500">
                          {stt}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800 text-sm">
                            {supplier.name}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Mã NCC: #{supplier.id}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {supplier.phone ? (
                            <a
                              href={`tel:${supplier.phone}`}
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                            >
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{supplier.phone}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Chưa cập nhật</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {supplier.address ? (
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{supplier.address}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Chưa cập nhật</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {supplier.status === 1 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              Tạm ngừng
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(supplier)}
                              className="p-1.5 hover:bg-orange-50 text-[#f68b1f] hover:text-[#d97706] rounded-md transition cursor-pointer"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-md transition cursor-pointer"
                              title="Chuyển vào thùng rác"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div>
                Hiển thị trang <span className="font-semibold">{currentPage}</span> / {pageCount}
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded text-xs font-semibold ${
                      currentPage === p
                        ? "bg-[#f68b1f] text-white"
                        : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  className="px-2.5 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL THÊM / SỬA NHÀ CUNG CẤP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#f68b1f]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    {editingItem ? "Chỉnh sửa Nhà cung cấp" : "Thêm mới Nhà cung cấp"}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingItem
                      ? `Cập nhật thông tin mã NCC #${editingItem.id}`
                      : "Điền thông tin đối tác cung cấp hoa tươi"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tên nhà cung cấp */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tên nhà cung cấp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Công ty Hoa Tươi Đà Lạt Hasfarm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: 450 Trần Hưng Đạo, P.2, TP. Đà Lạt, Lâm Đồng"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f]"
                />
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Trạng thái hợp tác
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#f68b1f] bg-white cursor-pointer"
                >
                  <option value={1}>Đang hoạt động (Hợp tác)</option>
                  <option value={0}>Tạm ngừng</option>
                </select>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#f68b1f] hover:bg-[#e67300] rounded-lg transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Lưu thay đổi" : "Tạo nhà cung cấp"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
