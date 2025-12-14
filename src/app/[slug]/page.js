// src/app/[slug]/page.js
import React from "react";
import MenuUI from "@/app/(client)/components/MenuUI";
import { apiGet } from "@/lib/apiClient"; // optional, we will try-catch around it

export default async function Page({ params }) {
  const { slug } = params;

  // Call the backend inside try/catch so errors don't bubble to Next's overlay
  try {
    // Use apiGet for convenience (it throws on non-OK), but we catch below
    const res = await apiGet(`/api/menu/${encodeURIComponent(slug)}`);

    // Expected shape: { success: true, data: { restaurant, categories, dishes } }
    const payload = res?.data ?? res;

    if (!payload || !payload.restaurant) {
      return (
        <main style={{ padding: 32 }}>
          <h1 style={{ color: "#fff" }}>Not found</h1>
          <p style={{ color: "#9E9E9E" }}>Restaurant not found.</p>
        </main>
      );
    }

    // If backend uses "active" boolean, handle it here. Also accept legacy isActive.
    const restaurant = payload.restaurant;
    const isActive = (restaurant.active ?? restaurant.isActive ?? true);

    if (!isActive) {
      return (
        <main style={{ padding: 32 }}>
          <h1 style={{ color: "#fff", marginBottom: 8 }}>{restaurant.name || "This restaurant"}</h1>
          <div style={{ padding: 16, borderRadius: 8, background: "#2A2A2A" }}>
            <p style={{ color: "#ff6b6b", margin: 0 }}>
              This restaurant is currently inactive. Public menu is not available.
            </p>
            {restaurant.email && (
              <p style={{ color: "#9E9E9E", marginTop: 8 }}>Contact: {restaurant.email}</p>
            )}
          </div>
        </main>
      );
    }

    // OK — render the Menu UI (client component)
    return (
      <MenuUI
        restaurant={payload.restaurant}
        categories={payload.categories || []}
        dishes={payload.dishes || []}
        slug={slug}
      />
    );
  } catch (err) {
    // handle network / API thrown errors gracefully
    const message = err?.message || "Failed to load restaurant";
    return (
      <main style={{ padding: 32 }}>
        <h1 style={{ color: "#fff" }}>Sorry</h1>
        <p style={{ color: "#f44336" }}>{message}</p>
        <p style={{ color: "#9E9E9E", marginTop: 10 }}>
          Try again later or contact support.
        </p>
      </main>
    );
  }
}
