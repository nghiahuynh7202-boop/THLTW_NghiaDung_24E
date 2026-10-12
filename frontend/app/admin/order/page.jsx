"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/shop/ui/Pagination";
import {
  getAdminOrders,
  getAdminOrderById,
  updateOrder,
  cancelOrder,
} from "@/services/orderServices";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

const ITEMS_PER_PAGE = 8;

const ORDER_STATUS_CONFIG = {
  1: {
    label: "Chờ xác nhận",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  2: {
    label: "Đang xử lý",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: CheckCircle,
  },
  3: {
    label: "Đang giao hàng",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    icon: Truck,
  },
  4: {
    label: "Đã giao thành công",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle,
  },
  5: {
    label: "Đã hủy",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + " đ";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function ProductThumbnail({ img, alt }) {
  const [hasError, setHasError] = useState(false);
  const hostname = typeof window !== "undefined" ? window.location.hostname || "127.0.0.1" : "127.0.0.1";
  
  const getSrc = (src) => {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) {
      return src;
    }
    const clean = src.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `http://${hostname}:8000/storage/${clean}`;
  };

  if (!img || hasError) {
    return (
      <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
        <ImageIcon className="w-4 h-4 text-gray-300" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-md bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
      <img
        src={getSrc(img)}
        alt={alt || "Hoa"}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshParam = searchParams.get("refresh");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal chi tiết đơn hàng
  const [viewingOrder, setViewingOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { per_page: 100 };
      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const res = await getAdminOrders(params);
      setOrders(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchTerm]);

  useEffect(() => {
    void fetchOrders();
  }, [refreshParam, fetchOrders]);

  // Phân trang phía client
  const pageCount = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
  const currentOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

  // Xem chi tiết đơn
  const handleOpenDetail = async (orderId) => {
    setModalLoading(true);
    setViewingOrder(null);
    try {
      const data = await getAdminOrderById(orderId);
      setViewingOrder(data);
    } catch (err) {
      alert("❌ Lỗi lấy thông tin chi tiết đơn hàng: " + (err?.message || "Không thể tải"));
    } finally {
      setModalLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrder(orderId, { status: Number(newStatus) });
      alert("✅ Cập nhật trạng thái đơn hàng thành công!");
      
      // Cập nhật lại trong state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: Number(newStatus) } : o))
      );
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder((prev) => ({ ...prev, status: Number(newStatus) }));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Cập nhật thất bại";
      alert("❌ " + msg);
    } finally {
      setUpdatingId(null);
    }
  };

  // Hủy đơn hàng kèm lý do
  const handleCancelOrder = async (orderId) => {
    const reason = prompt("Nhập lý do hủy đơn hàng:", "Khách hàng yêu cầu hủy đơn");
    if (reason === null) return;
    try {
      setUpdatingId(orderId);
      await cancelOrder(orderId, reason.trim() || "Admin hủy đơn hàng");
      alert("✅ Đã hủy đơn hàng thành công!");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 5, cancel_reason: reason } : o
        )
      );
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder((prev) => ({ ...prev, status: 5, cancel_reason: reason }));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Hủy đơn hàng thất bại";
      alert("❌ " + msg);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header trang */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#f68b1f]" />
              <span>Quản lý Đơn hàng</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Theo dõi danh sách đơn đặt hoa từ khách hàng, xử lý và cập nhật tiến độ giao vận
            </p>
          </div>

          <div className="flex items-center gap-2">
            
          </div>
        </div>

        {/* Thanh lọc & tìm kiếm */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Tabs bộ lọc trạng thái */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
                selectedStatus === "all"
                  ? "bg-gray-900 text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {Object.entries(ORDER_STATUS_CONFIG).map(([stKey, conf]) => (
              <button
                key={stKey}
                onClick={() => setSelectedStatus(stKey)}
                className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === stKey
                    ? "bg-[#f68b1f] text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedStatus === stKey ? "bg-white" : conf.dot
                  }`}
                />
                <span>{conf.label}</span>
              </button>
            ))}
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn, người nhận, SĐT..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-gray-50/70 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#f68b1f] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Bảng danh sách đơn hàng */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Subheader */}
          <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Danh sách đơn hàng</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16 text-center">Mã đơn</th>
                  <th className="py-3 px-4">Tên khách hàng</th>
                  <th className="py-3 px-4">Địa chỉ</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Tổng đơn</th>
                  <th className="py-3 px-4 text-center w-44">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Ngày đặt</th>
                  <th className="py-3 px-4 text-center w-28">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                        <span>Đang tải danh sách đơn hàng...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentOrders.length > 0 ? (
                  currentOrders.map((order) => {
                    const statusConf = ORDER_STATUS_CONFIG[order.status] || {
                      label: "Không xác định",
                      badge: "bg-gray-100 text-gray-600 border-gray-200",
                      dot: "bg-gray-400",
                    };

                    return (
                      <tr key={order.id} className="hover:bg-orange-50/20 transition-colors">
                        {/* 1. Mã đơn */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-gray-800">
                          #{order.id}
                        </td>

                        {/* 2. Tên khách hàng */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">
                            {order.name}
                          </div>
                          {order.user && (
                            <span className="inline-block mt-0.5 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.2 rounded font-medium">
                              User: {`#${order.user.id}`}
                            </span>
                          )}
                        </td>

                        {/* 3. Địa chỉ */}
                        <td className="py-3 px-4 text-gray-600 max-w-[220px]">
                          <div className="truncate" title={order.address || ""}>
                            {order.address || <span className="text-gray-300 italic">Chưa có</span>}
                          </div>
                        </td>

                        {/* 4. SĐT */}
                        <td className="py-3 px-4 font-mono text-gray-700">
                          {order.phone || "-"}
                        </td>

                        {/* 5. Tổng đơn */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#d32f2f] text-xs">
                            {formatCurrency(order.total)}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {order.payment_method?.toUpperCase() || "COD"} •{" "}
                            {order.payment_status === 1 ? (
                              <span className="text-emerald-600 font-medium">Đã thanh toán</span>
                            ) : (
                              <span className="text-amber-600 font-medium">Chưa thanh toán</span>
                            )}
                          </div>
                        </td>

                        {/* 6. Trạng thái sửa được trực tiếp */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-block relative">
                            <select
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer focus:outline-none transition-colors appearance-none pr-7 ${
                                statusConf.badge
                              } disabled:opacity-50`}
                              title="Nhấp để thay đổi trạng thái đơn hàng"
                            >
                              <option value="1">Chờ xác nhận</option>
                              <option value="2">Đang xử lý</option>
                              <option value="3">Đang giao hàng</option>
                              <option value="4">Đã giao thành công</option>
                              <option value="5">Đã hủy</option>
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                              ▼
                            </span>
                          </div>
                        </td>

                        {/* 7. Ngày đặt */}
                        <td className="py-3 px-4 text-center text-gray-500 text-[11px]">
                          {formatDate(order.created_at)}
                        </td>

                        {/* 8. Hành động xem chi tiết (đã bỏ nút hủy/xóa) */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenDetail(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium transition cursor-pointer"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-medium text-gray-500">
                        Không tìm thấy đơn hàng nào phù hợp
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="bg-gray-50/50 border-t border-gray-100 px-5 py-3">
              <Pagination
                currentPage={currentPage}
                pageCount={pageCount}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* MODAL CHI TIẾT ĐƠN HÀNG */}
        {(modalLoading || viewingOrder) && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs animate-in fade-in duration-200">
              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div>
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#f68b1f]" />
                    <span>Chi tiết đơn hàng #{viewingOrder?.id}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Đặt lúc: {formatDate(viewingOrder?.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {modalLoading ? (
                  <div className="py-12 flex items-center justify-center gap-2 text-gray-400">
                    <div className="w-5 h-5 border-2 border-[#f68b1f] border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải chi tiết đơn hàng...</span>
                  </div>
                ) : viewingOrder ? (
                  <>
                    {/* Trạng thái & Chuyển đổi nhanh */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-gray-500 text-[11px]">Trạng thái hiện tại:</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                              ORDER_STATUS_CONFIG[viewingOrder.status]?.badge
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                ORDER_STATUS_CONFIG[viewingOrder.status]?.dot
                              }`}
                            />
                            <span>{ORDER_STATUS_CONFIG[viewingOrder.status]?.label}</span>
                          </span>
                          {viewingOrder.cancel_reason && (
                            <span className="text-[11px] text-rose-500 italic">
                              (Lý do: {viewingOrder.cancel_reason})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dropdown thay đổi trạng thái */}
                      <div className="flex items-center gap-2">
                        <label className="text-gray-500 text-[11px] font-medium">
                          Chuyển trạng thái:
                        </label>
                        <select
                          value={viewingOrder.status}
                          disabled={updatingId === viewingOrder.id || viewingOrder.status === 4 || viewingOrder.status === 5}
                          onChange={(e) => handleUpdateStatus(viewingOrder.id, e.target.value)}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#f68b1f] cursor-pointer disabled:opacity-50"
                        >
                          <option value="1">1. Chờ xác nhận</option>
                          <option value="2">2. Đang xử lý</option>
                          <option value="3">3. Đang giao hàng</option>
                          <option value="4">4. Đã giao thành công</option>
                          <option value="5">5. Đã hủy đơn</option>
                        </select>
                      </div>
                    </div>

                    {/* Khách hàng & Giao nhận */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Người nhận */}
                      <div className="p-4 rounded-xl border border-gray-200 space-y-2">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5 pb-1 border-b border-gray-100">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Thông tin người nhận</span>
                        </div>
                        <div className="space-y-1 text-gray-600">
                          <p>
                            <strong>Họ tên:</strong> {viewingOrder.name}
                          </p>
                          <p>
                            <strong>Số điện thoại:</strong> {viewingOrder.phone}
                          </p>
                          {viewingOrder.email && (
                            <p>
                              <strong>Email:</strong> {viewingOrder.email}
                            </p>
                          )}
                          {viewingOrder.user && (
                            <p className="text-[11px] text-blue-600">
                              <strong>Tài khoản đặt:</strong> {viewingOrder.user.name} ({viewingOrder.user.email})
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Địa chỉ & Thanh toán */}
                      <div className="p-4 rounded-xl border border-gray-200 space-y-2">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5 pb-1 border-b border-gray-100">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>Địa chỉ & Thanh toán</span>
                        </div>
                        <div className="space-y-1 text-gray-600">
                          <p>
                            <strong>Địa chỉ:</strong> {viewingOrder.address}
                          </p>
                          <p>
                            <strong>Phương thức:</strong>{" "}
                            {viewingOrder.payment_method?.toUpperCase() || "COD"}
                          </p>
                          <p>
                            <strong>Thanh toán:</strong>{" "}
                            {viewingOrder.payment_status === 1 ? (
                              <span className="text-emerald-600 font-semibold">Đã thanh toán</span>
                            ) : (
                              <span className="text-amber-600 font-medium">Chưa thanh toán</span>
                            )}
                          </p>
                          {viewingOrder.note && (
                            <p className="text-gray-500 italic">
                              <strong>Ghi chú:</strong> &ldquo;{viewingOrder.note}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Danh sách sản phẩm trong đơn */}
                    <div className="space-y-2.5">
                      <div className="font-bold text-gray-800 flex items-center justify-between">
                        <span>Danh sách sản phẩm ({viewingOrder.details?.length || 0})</span>
                      </div>
                      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                        {viewingOrder.details?.map((detail) => (
                          <div
                            key={detail.id || detail.product_id}
                            className="p-3 flex items-center justify-between gap-3 bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <ProductThumbnail
                                img={detail.product?.image}
                                alt={detail.product?.name}
                              />
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {detail.product?.name || `Sản phẩm #${detail.product_id}`}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  Đơn giá: {formatCurrency(detail.price)} • Số lượng: x{detail.qty}
                                </p>
                              </div>
                            </div>
                            <div className="font-bold text-gray-800">
                              {formatCurrency(detail.amount || detail.price * detail.qty)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tổng kết tiền */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5 text-right">
                      {viewingOrder.discount_amount > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>Giảm giá khuyến mãi:</span>
                          <span className="text-rose-600 font-medium">
                            -{formatCurrency(viewingOrder.discount_amount)}
                          </span>
                        </div>
                      )}
                      {viewingOrder.shipping_fee > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>Phí vận chuyển:</span>
                          <span>+{formatCurrency(viewingOrder.shipping_fee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 border-t border-gray-200">
                        <span>Tổng tiền thanh toán:</span>
                        <span className="text-base text-[#d32f2f]">
                          {formatCurrency(viewingOrder.total)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition cursor-pointer"
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

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500 text-xs">
          Đang tải danh sách đơn hàng...
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  );
}
