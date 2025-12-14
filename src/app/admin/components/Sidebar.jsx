// src/app/admin/components/Sidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { IoRestaurantOutline, IoQrCodeOutline } from "react-icons/io5";
import { FaHotel } from "react-icons/fa";
import { MdOutlineDashboard, MdRestaurantMenu } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";
import { useAuth } from "@/contexts/AuthContext";
import fallbackLogo from "@/assets/restaurant-logo.png";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // user may be null while loading; default to owner view
  const role = user?.role || "restaurant_owner";

  // restaurant details when user is owner
  const restaurant = user?.restaurant || null;
  const restaurantName = restaurant?.name || "Restaurant";
  const logoSrc = restaurant?.logoUrl || fallbackLogo;

  // menus for each role
  const ownerMenu = [
    { name: "Restaurant Info", path: "/admin/restaurant-info", icon: <FaHotel /> },
    { name: "Menu Setup", path: "/admin/menu-setup", icon: <RiListSettingsLine /> },
    { name: "Dishes", path: "/admin/dishes", icon: <MdRestaurantMenu /> },
    { name: "QR Code", path: "/admin/qrcode", icon: <IoQrCodeOutline /> },
  ];

  const superMenu = [
    { name: "Dashboard", path: "/admin/super/dashboard", icon: <MdOutlineDashboard /> },
    { name: "Restaurants", path: "/admin/super/restaurants", icon: <IoRestaurantOutline /> },
    // add more later: Owners, Analytics, Settings...
  ];

  const menu = role === "super_admin" ? superMenu : ownerMenu;

  return (
    <aside className="h-screen w-64 bg-[#1A1A1A] shadow-md overflow-y-auto">
      <div className="border-b border-[#2A2A2A] py-6 px-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#2C2C2C] flex items-center justify-center overflow-hidden border border-[#444]">
          <Image src={logoSrc} alt={restaurantName} width={48} height={48} className="object-cover" />
        </div>

        <div className="flex flex-col">
          <span className="text-white text-lg font-semibold">{role === "super_admin" ? "Super Admin" : restaurantName}</span>
          <span className="text-[#888] text-sm">{role === "super_admin" ? "Platform Admin" : "Admin Panel"}</span>
        </div>
      </div>

      <nav className="px-4 py-6 text-lg space-y-3">
        {menu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className={`block p-2 rounded-xl transition ${isActive ? "bg-[#FFA900] text-black" : "text-[#9E9E9E] hover:bg-[#2C2C2C] hover:text-white"}`}>
              <div className="flex gap-3 items-center">{item.icon} <span>{item.name}</span></div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
