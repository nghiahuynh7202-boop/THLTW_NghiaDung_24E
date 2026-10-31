"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

// Provider quản lý giỏ hàng toàn ứng dụng
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Đọc giỏ hàng từ localStorage khi vừa vào trang
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) setCartItems(JSON.parse(saved));
    } catch {
      setCartItems([]);
    }
  }, []);

  // Lưu giỏ hàng vào state và localStorage
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  // Thêm sản phẩm vào giỏ
  const addToCart = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    const index = cartItems.findIndex((item) => item.id === product.id);

    if (index > -1) {
      const updated = [...cartItems];
      updated[index].qty = (Number(updated[index].qty) || 1) + qty;
      saveCart(updated);
    } else {
      saveCart([...cartItems, { ...product, qty }]);
    }
  };

  // Cập nhật số lượng món
  const updateQuantity = (id, quantity) => {
    const q = Number(quantity);
    if (q <= 0) {
      removeFromCart(id);
      return;
    }
    const updated = cartItems.map((item) => (item.id === id ? { ...item, qty: q } : item));
    saveCart(updated);
  };

  // Xóa 1 món khỏi giỏ
  const removeFromCart = (id) => {
    saveCart(cartItems.filter((item) => item.id !== id));
  };

  // Xóa toàn bộ giỏ
  const clearCart = () => {
    saveCart([]);
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
