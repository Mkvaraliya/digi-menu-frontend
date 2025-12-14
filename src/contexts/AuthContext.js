// src/contexts/AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken, clearToken, getUserFromStorage, setUserToStorage, clearUserFromStorage } from "@/lib/authToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = getToken();
      const u = getUserFromStorage();
      if (t) setTokenState(t);
      if (u) setUser(u);
    } catch (e) {
      console.error("Auth init error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (tokenValue, userValue) => {
    try {
      setToken(tokenValue); // authToken helper writes dm_token
      setUserToStorage(userValue);
      setTokenState(tokenValue);
      setUser(userValue);
    } catch (e) {
      console.error("login error", e);
    }
    router.push("/admin");
  };

  const logout = () => {
    try {
      clearToken();
      clearUserFromStorage();
      setTokenState(null);
      setUser(null);
    } catch (e) {
      console.error("logout error", e);
    }
    router.push("/admin/login");
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    setUser: (u) => {
      setUser(u);
      setUserToStorage(u);
    },
    setTokenState, // rarely used but available
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
