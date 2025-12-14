// src/app/admin/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("sidratechdigimenu@gmail.com");
  const [password, setPassword] = useState("SidraTechDigiMenu@161103");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiPost("/api/auth/login", { email, password });

      // expected shape: { success: true, data: { token, user } }
      if (!res?.success || !res?.data?.token) {
        throw new Error("Invalid login response");
      }

      // store centrally via AuthContext
      login(res.data.token, res.data.user);

      // redirect will be handled by AuthContext.login to /admin,
      // but keep a fallback
      router.push("/admin");
    } catch (err) {
      console.error("Login failed", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A] space-y-4"
      >
        <h1 className="text-xl font-semibold text-center mb-2">Admin Login</h1>

        {error && <p className="text-sm text-red-400 text-center mb-2">{error}</p>}

        <div className="space-y-1">
          <label className="text-sm text-[#ccc]">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-md bg-[#111] border border-[#333] text-sm focus:outline-none focus:border-[#FFA900]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-[#ccc]">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-md bg-[#111] border border-[#333] text-sm focus:outline-none focus:border-[#FFA900]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-2 rounded-md bg-[#FFA900] text-black font-semibold text-sm hover:bg-[#ffb733] disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
