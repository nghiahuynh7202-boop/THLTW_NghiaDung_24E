"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

/**
 * File này làm gì: Quản lý trạng thái đăng nhập (Auth State) cho toàn bộ ứng dụng.
 * Lưu `user` và `token` vào `localStorage` để giữ phiên đăng nhập khi F5 hoặc chuyển trang.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi tải trang: nạp token và user từ localStorage nếu đã đăng nhập trước đó
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");
      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      // Bỏ qua nếu dữ liệu lưu bị lỗi
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm đăng nhập: lưu thông tin vào state và localStorage
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    if (tokenData) {
      localStorage.setItem("token", tokenData);
      localStorage.setItem("accessToken", tokenData);
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  // Hàm cập nhật thông tin người dùng trong state và localStorage
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Hàm đăng xuất: làm rỗng state và xóa khỏi localStorage
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
