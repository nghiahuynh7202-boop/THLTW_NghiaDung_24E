"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  Heart,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");

  // Thống kê kinh doanh shop hoa
  const stats = [
    {
      title: "Tổng Doanh Thu Tháng",
      value: "48.550.000 đ",
      change: "+14.2%",
      icon: DollarSign,
      color: "bg-pink-50 text-pink-600 border-pink-200",
    },
    {
      title: "Đơn Đặt Hoa Mới",
      value: "128 Đơn",
      change: "+8.5%",
      icon: ShoppingBag,
      color: "bg-rose-50 text-rose-600 border-rose-200",
    },
    {
      title: "Mẫu Hoa Đang Bán",
      value: "714 Mẫu",
      change: "Còn hàng",
      icon: Package,
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      title: "Khách Hàng Thân Thiết",
      value: "1.420 Người",
      change: "+22%",
      icon: Users,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
  ];

  // Đơn hàng gần đây
  const recentOrders = [
    {
      id: "ORD-9901",
      customer: "Nguyễn Văn Nghĩa",
      phone: "0908123456",
      productSummary: "Bó hoa 'Thương' x 1",
      total: 350000,
      paymentMethod: "COD",
      status: "cho_xac_nhan",
      statusLabel: "Chờ xác nhận",
      date: "05/10/2026 08:30",
    },
    {
      id: "ORD-9902",
      customer: "Trần Thị Lan",
      phone: "0987654321",
      productSummary: "Giỏ hoa 'An Nhiên 2' x 1",
      total: 650000,
      paymentMethod: "Chuyển khoản",
      status: "da_xac_nhan",
      statusLabel: "Đã xác nhận",
      date: "05/10/2026 08:15",
    },
    {
      id: "ORD-9903",
      customer: "Lê Hoàng Dũng",
      phone: "0912345678",
      productSummary: "Bó hoa 'Pastel Love' x 1",
      total: 400000,
      paymentMethod: "Momo",
      status: "dang_giao",
      statusLabel: "Đang giao",
      date: "05/10/2026 07:50",
    },
    {
      id: "ORD-9904",
      customer: "Phạm Minh Tâm",
      phone: "0933445566",
      productSummary: "Bình 'Mini flower vase' x 2",
      total: 700000,
      paymentMethod: "COD",
      status: "hoan_tat",
      statusLabel: "Hoàn tất",
      date: "04/10/2026 19:20",
    },
  ];

  // Sản phẩm hoa nổi bật
  const sampleProducts = [
    {
      id: 1,
      name: "Bó hoa Thương",
      category: "Hoa sinh nhật",
      price: 350000,
      stock: 45,
      status: 1,
      image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      name: "Bó hoa Victo rose",
      category: "Hoa tình yêu",
      price: 300000,
      stock: 28,
      status: 1,
      image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      name: "Giỏ hoa An nhiên 2",
      category: "Hoa khai trương",
      price: 650000,
      stock: 12,
      status: 1,
      image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=200&auto=format&fit=crop&q=80",
    },
    {
      id: 4,
      name: "Bó hoa Pastel love",
      category: "Hoa chúc mừng",
      price: 400000,
      stock: 30,
      status: 1,
      image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&auto=format&fit=crop&q=80",
    },
  ];

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "cho_xac_nhan":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-3 h-3" />
            Chờ xác nhận
          </span>
        );
      case "da_xac_nhan":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
            <CheckCircle className="w-3 h-3" />
            Đã xác nhận
          </span>
        );
      case "dang_giao":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-600 border border-purple-200">
            <Truck className="w-3 h-3" />
            Đang giao
          </span>
        );
      case "hoan_tat":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Hoàn tất
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER CHÀO MỪNG TRẮNG HỒNG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-pink-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Quản Lý Cửa Hàng Hoa</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Xin chào Quản Trị Viên! 🌸
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Xem báo cáo kinh doanh, đơn đặt hoa và quản lý danh mục sản phẩm hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-sm shadow-pink-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mẫu Hoa Mới</span>
          </Link>
        </div>
      </div>

      {/* 2. CÁC THẺ CHỈ SỐ STATS TONE TRẮNG HỒNG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-pink-100/80 shadow-xs hover:border-pink-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500">{item.title}</span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{item.value}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs font-bold text-pink-600 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                    {item.change}
                  </span>
                  <span className="text-[11px] text-gray-400">tháng này</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BẢNG DỮ LIỆU CHÍNH */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="border-b border-pink-100 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-pink-50/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "orders"
                  ? "bg-pink-500 text-white shadow-xs"
                  : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Đơn Đặt Hoa Gần Đây</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "products"
                  ? "bg-pink-500 text-white shadow-xs"
                  : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Sản Phẩm Hoa Nổi Bật</span>
            </button>
          </div>

          <span className="text-xs text-pink-400 font-medium flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-pink-400" />
            <span>Dữ liệu bán hàng trực tiếp</span>
          </span>
        </div>

        {/* TAB 1: BẢNG ĐƠN HÀNG */}
        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-pink-50/50 border-b border-pink-100 text-pink-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Mã Đơn</th>
                  <th className="px-5 py-3.5">Khách Hàng</th>
                  <th className="px-5 py-3.5">Mẫu Hoa Đặt</th>
                  <th className="px-5 py-3.5">Tổng Tiền</th>
                  <th className="px-5 py-3.5">Thanh Toán</th>
                  <th className="px-5 py-3.5">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-pink-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-900">{order.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900">{order.customer}</div>
                      <div className="text-[11px] text-gray-400">{order.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{order.productSummary}</td>
                    <td className="px-5 py-3.5 font-extrabold text-rose-600">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold border border-pink-100">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(order.status)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: BẢNG SẢN PHẨM */}
        {activeTab === "products" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-pink-50/50 border-b border-pink-100 text-pink-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Hình Ảnh</th>
                  <th className="px-5 py-3.5">Tên Mẫu Hoa</th>
                  <th className="px-5 py-3.5">Danh Mục</th>
                  <th className="px-5 py-3.5">Giá Bán</th>
                  <th className="px-5 py-3.5">Tồn Kho</th>
                  <th className="px-5 py-3.5">Trạng Thái</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 font-medium">
                {sampleProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-pink-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded-xl border border-pink-100"
                      />
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{p.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{p.category}</td>
                    <td className="px-5 py-3.5 font-extrabold text-rose-600">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-700">{p.stock} bó</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                        Đang bán
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                          title="Sửa mẫu hoa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa tạm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
