"use client";

import AdminHeader from "@/components/Admin/AdminHeader.jsx";
import Sidebar from "@/components/Admin/Sidebar.jsx";
import "./admin_style.css";
import { AuthProvider } from "@/context/AuthContext";

import { Be_Vietnam_Pro } from "next/font/google";

const beVietNam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className={`bg-gray-100 text-gray-800 ${beVietNam.className}`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />

          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader />

            <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

