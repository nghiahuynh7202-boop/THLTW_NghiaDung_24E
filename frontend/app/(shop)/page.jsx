"use client";

import Banner from "@/components/Banner";
import CategorySlider from "@/components/CategorySlider";
import FlashSale from "@/components/home/FlashSale";
import ProductSection from "@/components/home/Productsection";
import HomePosts from "@/components/home/HomePosts";
import Toast from "@/components/home/Toast";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/useToast";

// Mỗi khung là một mục. Muốn thêm/bớt khung chỉ cần sửa danh sách này.
// category = slug danh mục trong database; value của tag = giá trị gửi lên API để lọc.
const SECTIONS = [
  {
    title: "SAN PHAM HOT",
    color: "bg-[#f68b1f]",
    link: "/category/hot",
    category: "hot",
    tags: [],
  },
  {
    title: "SAN PHAM MOI",
    color: "bg-[#b91c1c]",
    link: "/category/new",
    category: "new",
    tags: [],
  },
  {
    title: "SAN PHAM NOI BAT",
    color: "bg-[#e91e63]",
    link: "/products",
    category: "san-pham-noi-bat",
    tags: [],
  },
];

export default function HomePage() {
  const { addToCart } = useCart();
  const toast = useToast();

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.show(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <div className="bg-white min-h-screen py-4 sm:py-6 font-sans">
      <Toast message={toast.message} />

      {/* KHU VỰC BANNER: Mở rộng chiều ngang (max-w-[1480px]) tạo không gian rộng rãi, thoáng đẹp */}
      <div className="w-full max-w-[1480px] mx-auto px-2 sm:px-4 lg:px-6 mb-8 sm:mb-10">
        <Banner />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-9 sm:space-y-12">
        <CategorySlider />

        <FlashSale onAddToCart={handleAddToCart} />

        {SECTIONS.map((s) => (
          <ProductSection key={s.category} {...s} onAddToCart={handleAddToCart} />
        ))}

        {/* PHẦN BÀI VIẾT & TIN TỨC HOA TƯƠI Ở CUỐI TRANG */}
        <HomePosts />
      </div>
    </div>
  );
}
