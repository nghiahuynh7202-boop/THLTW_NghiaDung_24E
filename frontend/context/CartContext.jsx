"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalCount: 0,
});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Lỗi đọc giỏ hàng từ localStorage:", e);
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (e) {
      console.error("Lỗi lưu giỏ hàng:", e);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, Number(quantity) || 1);
    const existingIndex = cartItems.findIndex((item) => item.id === product.id);
    let updated;
    if (existingIndex > -1) {
      updated = [...cartItems];
      const currentQty = Number(updated[existingIndex].quantity ?? updated[existingIndex].qty ?? 1);
      const newQty = currentQty + qtyToAdd;
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...product,
        quantity: newQty,
        qty: newQty,
      };
    } else {
      updated = [
        ...cartItems,
        {
          ...product,
          quantity: qtyToAdd,
          qty: qtyToAdd,
        },
      ];
    }
    saveCart(updated);
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter((item) => item.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId, quantity) => {
    const q = Number(quantity);
    if (q <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: q, qty: q } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalCount = isMounted
    ? cartItems.reduce(
        (acc, item) => acc + Number(item.quantity ?? item.qty ?? 1),
        0
      )
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
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
