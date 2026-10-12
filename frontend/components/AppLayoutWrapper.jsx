"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
export default function AppLayoutWrapper({ children, }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");
    if (isAdmin) {
        return <>{children}</>;
    }
    return (<>
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </>);
}
