export function formatProduct(p) {
  if (!p) return null;
  const price = Number(p.price || 0);
  const salePrice =
    p.sale_price !== null && p.sale_price !== undefined && p.sale_price !== ""
      ? Number(p.sale_price)
      : null;
  const hasSale = salePrice !== null && salePrice > 0 && salePrice < price;

  return {
    ...p,
    id: p.id,
    name: p.name || "",
    slug: p.slug || String(p.id),
    // Giá so sánh là giá bán thực tế, tức đã trừ khuyến mãi
    price: hasSale ? salePrice : price,
    originalPrice: hasSale ? price : null,
    image: p.image || "/images/hoa.jpg",
    category_id: p.category_id,
    category: p.category,
    brand_id: p.brand_id,
    brand: p.brand,
    created_at: p.created_at,
  };
}
