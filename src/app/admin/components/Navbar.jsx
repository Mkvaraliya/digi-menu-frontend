// src/app/admin/components/Navbar.jsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/app/(client)/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();

  const restaurantName = user?.restaurantName || "Restaurant";
  const adminName = user?.name || "Admin";

  return (
    <header className="flex justify-between items-center px-4 py-4 border border-[#2A2A2A] bg-[#1A1A1A]">
      <div className="flex flex-col">
        <p className="text-sm text-[#CCCCCC]">Welcome, {adminName}</p>
        <p className="text-xs text-[#888888]">{restaurantName}</p>
      </div>

      <div className="flex items-center gap-4">
        <h1 className="text-sm md:text-base font-semibold text-white">
          Made with <span className="text-[#FFA900]">❤️</span> by SidraTech.In
        </h1>
        <Button
          variant="outline"
          size="sm"
          className="border-[#FFA900] text-[#FFA900] hover:bg-[#FFA900] hover:text-black"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
