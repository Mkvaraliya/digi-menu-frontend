// src/app/admin/layout.js
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  // 🔹 On /admin/login: no sidebar/navbar, just the login form
  if (isLoginPage) {
    return <>{children}</>;
  }

  // 🔹 On all other /admin routes: show dashboard shell
  return (
    <div className="flex h-screen bg-[#111] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-[#111]">
          {children}
        </main>
      </div>
    </div>
  );
}





