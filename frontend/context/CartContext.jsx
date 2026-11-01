"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext();

// Provider quản lý giỏ hàng riêng cho từng tài khoản người dùng
export function CartProvider({ children }) {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  // Nạp giỏ hàng tương ứng với user_id khi đăng nhập hoặc đổi tài khoản
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`cart_${user.id}`);
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
    } else {
      // Khi chưa đăng nhập hoặc vừa đăng xuất: làm rỗng giỏ hàng
      setCartItems([]);
    }
  }, [user?.id]);

  // Lưu giỏ hàng của tài khoản hiện tại vào state và localStorage
  const saveCart = (items) => {
    setCartItems(items);
    if (user?.id) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
    }
  };

  // Thêm sản phẩm vào giỏ (bắt buộc đăng nhập trước)
  const addToCart = (product, quantity = 1) => {
    if (!user?.id) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      router.push("/login");
      return false;
    }

    const qty = Math.max(1, Number(quantity) || 1);
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
      updated = [...cartItems];
      updated[index].qty = (Number(updated[index].qty) || 1) + qty;
      updated[index].price = payablePrice;
    } else {
      updated = [
        ...cartItems,
        {
          ...product,
          price: payablePrice,
          originalPrice: hasSale ? origPrice : null,
          qty,
        },
      ];
    }

    saveCart(updated);
    return true;
  };

  // Cập nhật số lượng món
  const updateQuantity = (id, quantity) => {
    if (!user?.id) return;
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
    if (!user?.id) return;
    saveCart(cartItems.filter((item) => item.id !== id));
  };

  // Xóa toàn bộ giỏ của tài khoản hiện tại
  const clearCart = () => {
    if (user?.id) {
      localStorage.removeItem(`cart_${user.id}`);
    }
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
