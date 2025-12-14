// app/[slug]/layout.js
import React from "react";
import Navbar from "@/app/(client)/components/Navbar"; // client component
import PublicFooter from "@/app/(client)/components/PublicFooter";

export const metadata = {
  // optionally set metadata here
};

export default async function SlugLayout({ children, params }) {
  const { slug } = params;

  let restaurant = null;

  try {
    // fetch menu endpoint that returns { success, data: { restaurant, ... } }
    // Use absolute URL so server can call the API. Use NO cache during dev.
    const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";
    const res = await fetch(`${base}/api/menu/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      // if your API requires headers for server-to-server auth, include them here
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      // adapt to your controllers shape
      restaurant = json?.data?.restaurant ?? json?.restaurant ?? null;
    } else {
      // leave restaurant null if non-200
      console.warn("menu fetch status", res.status);
    }
  } catch (err) {
    console.error("Failed to fetch restaurant for layout:", err);
  }

  return (
    <>
      {/* Navbar is client; passing server-fetched restaurant as prop is fine */}
      <Navbar slug={slug} restaurant={restaurant} />
      <main className="min-h-[calc(100vh-160px)]">
        {children}
      </main>
      <PublicFooter />
    </>
  );
}
