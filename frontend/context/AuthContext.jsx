"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token") || localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");
      if (savedToken) setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error("Lỗi đọc Auth từ localStorage:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    try {
      if (tokenData) localStorage.setItem("token", tokenData);
      if (userData) localStorage.setItem("user", JSON.stringify(userData));
    } catch (e) {
      console.error("Lỗi lưu Auth vào localStorage:", e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    } catch (e) {
      console.error("Lỗi xóa Auth:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
