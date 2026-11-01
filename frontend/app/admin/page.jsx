"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Truck,
  ArrowRight,
  Home,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { getAdminOrders } from "@/services/orderServices";
import { getAdminProducts } from "@/services/productServices";
import { getUsers } from "@/services/userServices";
import API_CONFIG from "@/config/api";

function AdminProductThumb({ item }) {
  const [hasError, setHasError] = useState(false);
  const raw = item?.image ? String(item.image).trim() : "";

  const getSrc = (img) => {
    if (!img) return "";
    if (img.startsWith("http") || img.startsWith("blob:") || img.startsWith("/images/")) return img;
    const clean = img.replace(/^\/?storage\//, "").replace(/^\/+/, "");
    return `${API_CONFIG.ROOT_URL}/storage/${clean}`;
  };

  const src = getSrc(raw);

  if (!raw || hasError || !src) {
    return (
      <div className="w-9 h-9 rounded-xs bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
        <ImageIcon className="w-4 h-4 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={item.name || "Sản phẩm"}
      onError={() => setHasError(true)}
      className="w-9 h-9 object-cover rounded-xs border border-gray-200 mx-auto"
    />
  );
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("orders");

  // Dữ liệu thực từ database
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
          getAdminOrders({ per_page: 100 }),
          getAdminProducts({ per_page: 100 }),
          getUsers({ per_page: 100 }),
        ]);

        if (ordersRes.status === "fulfilled") {
          const list = ordersRes.value?.data || ordersRes.value || [];
          setOrders(Array.isArray(list) ? list : []);
        }

        if (productsRes.status === "fulfilled") {
          const list = productsRes.value?.data || productsRes.value || [];
          setProducts(Array.isArray(list) ? list : []);
        }

        if (usersRes.status === "fulfilled") {
          const list = usersRes.value || [];
          setUsers(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboardData();
  }, []);

  // Tính toán số liệu thống kê thật
  const orderCount = orders.length;
  const revenue = orders
    .filter((o) => Number(o.status) !== 5) // Không tính đơn đã hủy
    .reduce((sum, o) => sum + Number(o.total || 0), 0);
  const revenueDisplay =
    revenue >= 1_000_000
      ? (revenue / 1_000_000).toFixed(2) + "M"
      : Number(revenue).toLocaleString("vi-VN") + " đ";

  const productCount = products.length;
  const userCount = users.length;

  const stats = [
    {
      title: "Tổng đơn hàng",
      value: String(orderCount),
      desc: "Tổng số đơn trong hệ thống",
      icon: ShoppingBag,
      bg: "bg-[#00c0ef]",
      link: "/admin/order",
    },
    {
      title: "Tổng doanh thu",
      value: revenueDisplay,
      desc: "Doanh thu đơn không bị hủy",
      icon: DollarSign,
      bg: "bg-[#00a65a]",
      link: "/admin/order",
    },
    {
      title: "Sản phẩm",
      value: String(productCount),
      desc: "Mẫu hoa trên hệ thống",
      icon: Package,
      bg: "bg-[#f39c12]",
      link: "/admin/products",
    },
    {
      title: "Khách hàng",
      value: String(userCount),
      desc: "Thành viên đã đăng ký",
      icon: Users,
      bg: "bg-[#dd4b39]",
      link: "/admin/users",
    },
  ];

  // 5 đơn hàng mới nhất
  const recentOrders = orders.slice(0, 5);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + " đ";
  };

  const getStatusBadge = (status) => {
    const s = Number(status);
    if (s === 1 || status === "cho_xac_nhan") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3" /> Chờ xác nhận
        </span>
      );
    }
    if (s === 2 || status === "da_xac_nhan") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3" /> Đang xử lý
        </span>
      );
    }
    if (s === 3 || status === "dang_giao") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-purple-100 text-purple-800">
          <Truck className="w-3 h-3" /> Đang giao
        </span>
      );
    }
    if (s === 4 || status === "hoan_tat") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3 h-3" /> Hoàn tất
        </span>
      );
    }
    if (s === 5 || status === "da_huy") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-rose-100 text-rose-800">
          Đã hủy
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-gray-100 text-gray-800">
        {status || "-"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-300 gap-2">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Bảng điều khiển
        </h1>

        <div className="flex items-center text-xs text-gray-500 gap-1.5">
          <Link href="/admin" className="flex items-center gap-1 text-[#3c8dbc]">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-700 font-semibold">Bảng điều khiển</span>
        </div>
      </div>

      {/* 2. STAT SMALL BOXES THEO PHONG CÁCH ADMINLTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`${item.bg} text-white rounded-xs shadow-2xs overflow-hidden flex flex-col justify-between relative`}
            >
              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-extrabold tracking-tight">
                    {loading ? "..." : item.value}
                  </h3>
                  <p className="text-xs font-semibold uppercase mt-1 text-white/90">
                    {item.title}
                  </p>
                </div>
                <Icon className="w-12 h-12 text-black/15 absolute right-3 top-3 pointer-events-none" />
              </div>
              <Link
                href={item.link}
                className="bg-black/15 hover:bg-black/25 text-white/90 hover:text-white py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* 3. BẢNG DỮ LIỆU BOX ADMINLTE */}
      <div className="bg-white border border-gray-300 border-t-3 border-t-[#3c8dbc] shadow-2xs">
        <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                activeTab === "orders"
                  ? "bg-[#3c8dbc] text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Đơn hàng gần đây
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                activeTab === "products"
                  ? "bg-[#3c8dbc] text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sản phẩm nổi bật
            </button>
          </div>

          <span className="text-xs text-gray-500 font-medium">
            Dữ liệu trực tiếp từ hệ thống
          </span>
        </div>

        {/* TAB 1: BẢNG ĐƠN HÀNG */}
        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead className="bg-[#3c8dbc] text-white font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Mã đơn</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Khách hàng</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Sản phẩm đặt</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Tổng tiền</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Thanh toán</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Trạng thái</th>
                  <th className="px-4 py-2.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {loading ? "Đang tải dữ liệu..." : "Chưa có đơn hàng"}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const productSummary =
                      Array.isArray(order.items) && order.items.length > 0
                        ? order.items
                            .map((it) => `${it.product_name || it.product?.name || "Hoa tươi"} x ${it.qty || 1}`)
                            .join(", ")
                        : `Đơn hàng #${order.id}`;

                    return (
                      <tr key={order.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-gray-900 border-r border-gray-200">
                          #{order.id}
                        </td>
                        <td className="px-4 py-2.5 border-r border-gray-200">
                          <div className="font-semibold text-gray-900">
                            {order.name || order.user?.name || "Khách hàng"}
                          </div>
                          <div className="text-[11px] text-gray-500">{order.phone || "-"}</div>
                        </td>
                        <td className="px-4 py-2.5 border-r border-gray-200 max-w-[260px] truncate" title={productSummary}>
                          {productSummary}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-red-600 border-r border-gray-200">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-2.5 border-r border-gray-200">
                          <span className="px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {order.payment_method?.toUpperCase() || "COD"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 border-r border-gray-200">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Link
                            href="/admin/order"
                            className="p-1 bg-[#00c0ef] text-white hover:bg-[#00acd6] rounded-xs inline-flex items-center"
                            title="Xem chi tiết đơn"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: BẢNG SẢN PHẨM */}
        {activeTab === "products" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700 border-collapse">
              <thead className="bg-[#3c8dbc] text-white font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 w-16 text-center border-r border-[#367fa9]">Hình ảnh</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Tên sản phẩm</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Danh mục</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Giá bán</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Tồn kho</th>
                  <th className="px-4 py-2.5 border-r border-[#367fa9]">Trạng thái</th>
                  <th className="px-4 py-2.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {loading ? "Đang tải dữ liệu..." : "Chưa có sản phẩm"}
                    </td>
                  </tr>
                ) : (
                  products.slice(0, 8).map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-2 text-center border-r border-gray-200">
                        <AdminProductThumb item={p} />
                      </td>
                      <td className="px-4 py-2 font-bold text-gray-900 border-r border-gray-200">
                        {p.name}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200">
                        {p.category?.name || p.category || "Hoa tươi"}
                      </td>
                      <td className="px-4 py-2 font-bold text-red-600 border-r border-gray-200">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200">
                        {p.qty ?? p.stock ?? 0} bó
                      </td>
                      <td className="px-4 py-2 border-r border-gray-200">
                        <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                          Đang bán
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Link
                          href={`/admin/products/update?id=${p.id}`}
                          className="p-1 bg-[#f39c12] text-white hover:bg-[#e08e0b] rounded-xs inline-block"
                          title="Sửa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
