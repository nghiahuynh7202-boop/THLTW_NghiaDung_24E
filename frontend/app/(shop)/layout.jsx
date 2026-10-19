import Header from "@/components/shop/Header.jsx";
import Footer from "@/components/shop/Footer.jsx";

export default function ShopLayout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
