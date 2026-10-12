"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DollarSign, ShoppingBag, Package, Users, Eye, Edit, Trash2, CheckCircle, Clock, Truck, ArrowRight, Home, ChevronRight, } from "lucide-react";
export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState("orders");
    // Thống kê kinh doanh theo dạng Small Box AdminLTE
    const stats = [
        {
            title: "Đơn hàng mới",
            value: "128",
            desc: "Đơn đặt hoa trong tháng",
            icon: ShoppingBag,
            bg: "bg-[#00c0ef]",
            link: "/admin/orders",
        },
        {
            title: "Tổng doanh thu",
            value: "48.55M",
            desc: "Doanh thu tháng hiện tại",
            icon: DollarSign,
            bg: "bg-[#00a65a]",
            link: "/admin/orders",
        },
        {
            title: "Mẫu hoa đang bán",
            value: "714",
            desc: "Sản phẩm hoạt động",
            icon: Package,
            bg: "bg-[#f39c12]",
            link: "/admin/products",
        },
        {
            title: "Khách hàng",
            value: "1,420",
            desc: "Thành viên đã đăng ký",
            icon: Users,
            bg: "bg-[#dd4b39]",
            link: "/admin/users",
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
    const formatPrice = (amount) => {
        return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "cho_xac_nhan":
                return (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3"/>
            Chờ xác nhận
          </span>);
            case "da_xac_nhan":
                return (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3"/>
            Đã xác nhận
          </span>);
            case "dang_giao":
                return (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3"/>
            Đang giao
          </span>);
            case "hoan_tat":
                return (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3"/>
            Hoàn tất
          </span>);
            default:
                return (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-bold bg-gray-100 text-gray-800">
            {status}
          </span>);
        }
    };
    return (<div className="space-y-4">
      {/* 1. HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-300 gap-2">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          Bảng điều khiển
        </h1>

        <div className="flex items-center text-xs text-gray-500 gap-1.5">
          <Link href="/admin" className="flex items-center gap-1 text-[#3c8dbc]">
            <Home className="w-3.5 h-3.5"/>
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400"/>
          <span className="text-gray-700 font-semibold">Bảng điều khiển</span>
        </div>
      </div>

      {/* 2. STAT SMALL BOXES THEO PHONG CÁCH ADMINLTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
            const Icon = item.icon;
            return (<div key={idx} className={`${item.bg} text-white rounded-xs shadow-2xs overflow-hidden flex flex-col justify-between relative`}>
              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-extrabold tracking-tight">{item.value}</h3>
                  <p className="text-xs font-semibold uppercase mt-1 text-white/90">{item.title}</p>
                </div>
                <Icon className="w-12 h-12 text-black/15 absolute right-3 top-3 pointer-events-none"/>
              </div>
              <Link href={item.link} className="bg-black/15 hover:bg-black/25 text-white/90 hover:text-white py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>);
        })}
      </div>

      {/* 3. BẢNG DỮ LIỆU BOX ADMINLTE */}
      <div className="bg-white border border-gray-300 border-t-3 border-t-[#3c8dbc] shadow-2xs">
        <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setActiveTab("orders")} className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${activeTab === "orders"
            ? "bg-[#3c8dbc] text-white"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
              Đơn hàng gần đây
            </button>
            <button type="button" onClick={() => setActiveTab("products")} className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${activeTab === "products"
            ? "bg-[#3c8dbc] text-white"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
              Sản phẩm nổi bật
            </button>
          </div>

          <span className="text-xs text-gray-500 font-medium">
            Dữ liệu trực tiếp từ hệ thống
          </span>
        </div>

        {/* TAB 1: BẢNG ĐƠN HÀNG */}
        {activeTab === "orders" && (<div className="overflow-x-auto">
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
                {recentOrders.map((order) => (<tr key={order.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-gray-900 border-r border-gray-200">{order.id}</td>
                    <td className="px-4 py-2.5 border-r border-gray-200">
                      <div className="font-semibold text-gray-900">{order.customer}</div>
                      <div className="text-[11px] text-gray-500">{order.phone}</div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-gray-200">{order.productSummary}</td>
                    <td className="px-4 py-2.5 font-bold text-red-600 border-r border-gray-200">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-2.5 border-r border-gray-200">
                      <span className="px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 border-r border-gray-200">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" className="p-1 bg-[#00c0ef] text-white hover:bg-[#00acd6] rounded-xs" title="Xem chi tiết">
                          <Eye className="w-3.5 h-3.5"/>
                        </button>
                        <button type="button" className="p-1 bg-[#f39c12] text-white hover:bg-[#e08e0b] rounded-xs" title="Sửa">
                          <Edit className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>)}

        {/* TAB 2: BẢNG SẢN PHẨM */}
        {activeTab === "products" && (<div className="overflow-x-auto">
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
                {sampleProducts.map((p) => (<tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-2 text-center border-r border-gray-200">
                      <Image src={p.image} alt={p.name} width={36} height={36} unoptimized className="w-9 h-9 object-cover rounded-xs border border-gray-200 mx-auto"/>
                    </td>
                    <td className="px-4 py-2 font-bold text-gray-900 border-r border-gray-200">{p.name}</td>
                    <td className="px-4 py-2 border-r border-gray-200">{p.category}</td>
                    <td className="px-4 py-2 font-bold text-red-600 border-r border-gray-200">{formatPrice(p.price)}</td>
                    <td className="px-4 py-2 border-r border-gray-200">{p.stock} bó</td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                        Đang bán
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" className="p-1 bg-[#f39c12] text-white hover:bg-[#e08e0b] rounded-xs" title="Sửa">
                          <Edit className="w-3.5 h-3.5"/>
                        </button>
                        <button type="button" className="p-1 bg-[#dd4b39] text-white hover:bg-[#d73925] rounded-xs" title="Xóa tạm">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>)}
      </div>
    </div>);
}
