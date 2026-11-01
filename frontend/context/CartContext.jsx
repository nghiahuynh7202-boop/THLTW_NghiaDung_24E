"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext();

// Provider quản lý giỏ hàng (hỗ trợ cả Khách vãng lai và Thành viên)
export function CartProvider({ children }) {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Khóa lưu giỏ hàng trong localStorage: nếu đăng nhập thì theo user.id, nếu là khách thì lưu 'cart_guest'
  const cartKey = user?.id ? `cart_${user.id}` : "cart_guest";

  // Nạp giỏ hàng từ localStorage khi tải trang hoặc đổi tài khoản
  useEffect(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      setCartItems(saved ? JSON.parse(saved) : []);
    } catch {
      setCartItems([]);
    }
  }, [cartKey]);

  // Lưu giỏ hàng vào state và localStorage
  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem(cartKey, JSON.stringify(items));
    } catch (e) {
      console.error("Lỗi lưu giỏ hàng:", e);
    }
  };

  // Thêm sản phẩm vào giỏ (Khách & Thành viên đều dùng được)
  const addToCart = (product, quantity = 1) => {

    const qty = Math.max(1, Number(quantity) || 1);
    // Lấy tồn kho thực tế từ sản phẩm (mặc định 999 nếu chưa set)
    const maxStock = Number(product.stock ?? product.qty ?? 999);

    if (maxStock <= 0) {
      alert("Sản phẩm này hiện đã hết hàng trong kho!");
      return false;
    }

    // Giá phải trả = salePrice nếu có, ngược lại là price
    const origPrice = Number(product.price || 0);
    const sale =
      product.salePrice !== undefined && product.salePrice !== null
        ? Number(product.salePrice)
        : (product.sale_price ? Number(product.sale_price) : null);
    const hasSale = sale !== null && sale > 0 && sale < origPrice;
    const payablePrice = hasSale ? sale : origPrice;

    const index = cartItems.findIndex((item) => item.id === product.id);
    let updated;

    if (index > -1) {
      const currentQty = Number(cartItems[index].qty) || 1;
      const newQty = currentQty + qty;

      // KIỂM TRA TỒN KHO: Không cho thêm quá số lượng trong kho
      if (newQty > maxStock) {
        alert(`Kho chỉ còn ${maxStock} sản phẩm (bạn đã có ${currentQty} trong giỏ)!`);
        return false;
      }

      updated = [...cartItems];
      updated[index].qty = newQty;
      updated[index].price = payablePrice;
      updated[index].stock = maxStock;
      if (!updated[index].image && (product.image || product.thumbnail)) {
        updated[index].image = product.image || product.thumbnail;
      }
    } else {
      // KIỂM TRA TỒN KHO
      if (qty > maxStock) {
        alert(`Kho chỉ còn tối đa ${maxStock} sản phẩm!`);
        return false;
      }

      updated = [
        ...cartItems,
        {
          ...product,
          stock: maxStock, // Lưu số lượng tồn kho
          price: payablePrice,
          originalPrice: hasSale ? origPrice : null,
          qty,
          image: product.image || product.thumbnail || "/images/hoa.jpg",
        },
      ];
    }

    saveCart(updated);
    return true;
  };

  // Cập nhật số lượng món (có kiểm tra tồn kho)
  const updateQuantity = (id, quantity) => {
    const q = Number(quantity);
    if (q <= 0) {
      removeFromCart(id);
      return;
    }

    const updated = cartItems.map((item) => {
      if (item.id !== id) return item;
      const maxStock = Number(item.stock ?? 999);
      // KIỂM TRA TỒN KHO: Nếu số lượng mới vượt kho thì báo lỗi và giới hạn lại
      if (q > maxStock) {
        alert(`Kho chỉ còn tối đa ${maxStock} sản phẩm!`);
        return { ...item, qty: maxStock };
      }
      return { ...item, qty: q };
    });

    saveCart(updated);
  };

  // Xóa 1 món khỏi giỏ
  const removeFromCart = (id) => {
    saveCart(cartItems.filter((item) => item.id !== id));
  };

  // Xóa toàn bộ giỏ
  const clearCart = () => {
    try {
      localStorage.removeItem(cartKey);
    } catch {}
    setCartItems([]);
  };

  // Tổng số lượng món trong giỏ
  const totalCount = cartItems.reduce((sum, item) => sum + Number(item.qty || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export default CartContext;
