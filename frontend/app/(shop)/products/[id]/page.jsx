"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductBySlug } from "@/services/productServices";
import { formatProduct } from "@/lib/product";
import ProductDetail from "@/components/products/ProductDetail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * File này làm gì: Trang Chi Tiết Sản Phẩm (Product Detail).
 * Lấy slug hoặc id từ URL, gọi API lấy thông tin chi tiết hoa và hiển thị qua component `ProductDetail`.
 */
export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug || params?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await getProductBySlug(slug);
        const productData = res?.data || res;
        
        if (productData && Object.keys(productData).length > 0) {
          setProduct(formatProduct(productData));
        } else {
          setError("Không tìm thấy sản phẩm");
        }
      } catch (err) {
        console.error(" Lỗi:", err);
        setError("Có lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 hover:gap-3 transition"
        >
          <ArrowLeft size={20} />
          Quay lại
        </Link>
      </div>

      {loading && (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 text-lg">Đang tải sản phẩm...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 text-lg mb-4 font-semibold">⚠️ {error}</p>
            <Link 
              href="/products" 
              className="inline-block text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      )}

      {product && !loading && !error && (
        <>
          <ProductDetail product={product} />
        </>
      )}
    </div>
  );
}
