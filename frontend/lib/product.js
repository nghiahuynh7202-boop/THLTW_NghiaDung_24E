// Chuẩn hóa sản phẩm: price luôn là giá gốc, salePrice là giá sau giảm (null nếu không có sale)
export function formatProduct(p) {
  if (!p) return null;
  const price = Number(p.price || 0);
  const rawSale =
    p.sale_price !== null && p.sale_price !== undefined && p.sale_price !== ""
      ? Number(p.sale_price)
      : null;
  const hasSale = rawSale !== null && rawSale > 0 && rawSale < price;

  return {
    ...p,
    id: p.id,
    name: p.name || "",
    slug: p.slug || String(p.id),
    price: price, // Luôn luôn là giá gốc
    salePrice: hasSale ? rawSale : null, // Giá sau giảm (null nếu không có sale)
    image: p.image || "",
    category_id: p.category_id,
    category: p.category,
    brand_id: p.brand_id,
    brand: p.brand,
    is_featured: Number(p.is_featured ?? 0) === 1,
    qty: Number(p.qty ?? 0),
    created_at: p.created_at,
  };
}
