// src/app/admin/dishes/[id]/page.js
"use client";

import React, { useEffect, useState } from "react";
import { FiImage, FiTrash2, FiEdit, FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { apiAuthGet, apiAuthDelete } from "@/lib/apiClient";
import { toast } from "sonner";

export default function ViewDishPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [dish, setDish] = useState(null);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ─────────────────────────────
  // Load single dish
  // ─────────────────────────────
  useEffect(() => {
    if (!id) {
      setError("Missing dish id in route.");
      setLoading(false);
      return;
    }

    const fetchDish = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiAuthGet(`/api/owner/dishes/${id}`);
        // backend returns { success, data: {...} }
        setDish(res.data || null);
      } catch (err) {
        console.error("Failed to fetch dish:", err);
        setError(err.message || "Failed to fetch dish");
        setDish(null);
        toast.error("Failed to load dish");
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [id]);

  // ─────────────────────────────
  // Delete with toast confirmation
  // ─────────────────────────────
  const doDelete = async () => {
    if (!id) return;
    try {
      setDeletingId(id);
      await apiAuthDelete(`/api/owner/dishes/${id}`);
      toast.success("Dish deleted");
      router.push("/admin/dishes");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Error deleting dish");
      setDeletingId(null);
    }
  };

  const handleDelete = () => {
    if (!dish) return;
    toast.warning("Delete this dish?", {
      description: `"${dish.name}" will be permanently removed.`,
      duration: 8000,
      action: {
        label: "Delete",
        onClick: () => doDelete(),
      },
    });
  };

  const handleBack = () => router.push("/admin/dishes");

  // ─────────────────────────────
  // UI states
  // ─────────────────────────────

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen px-6 py-6 text-white border border-[#2A2A2A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-[#ffb300] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#f5f5f5]">Loading dish...</p>
        </div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="bg-[#121212] min-h-screen px-6 py-6 text-white border border-[#2A2A2A]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">View Dish</h2>
            <div className="text-sm text-[#9a9a9a]">Error state</div>
          </div>

          <div className="rounded-lg border border-[#2A2A2A] p-6 bg-[#0f0f0f]">
            <div className="text-red-400 mb-4">
              {error || "Dish not found"}
            </div>

            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-[#2A2A2A] hover:bg-white/5 flex items-center gap-2"
            >
              <FiArrowLeft />
              Back to list
            </button>

            <div className="text-xs text-[#9a9a9a] mt-4">
              Make sure the dish exists and your backend route{" "}
              <code>/api/owner/dishes/:id</code> is returning the correct data.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal success UI
  const tasteText = dish.tasteId?.name || "-";
  const categoryText = dish.categoryId?.name || "-";
  const subcategoryText = dish.subcategoryId?.name || "-";
  const statusText = dish.status || "-";

  return (
    <div className="bg-[#121212] min-h-screen px-6 py-6 text-white border border-[#2A2A2A]">
      {/* top bar */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-3 py-2 rounded-lg border border-[#2A2A2A] hover:bg-white/5 flex items-center gap-2 text-sm"
            >
              <FiArrowLeft />
              Back
            </button>
            <h2 className="text-xl font-semibold">View Dish</h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/dishes/edit/${id}`)}
              className="px-4 py-2 rounded-lg bg-[#ffb300] text-black flex items-center gap-2"
              disabled={!!deletingId}
            >
              <FiEdit /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={!!deletingId}
              className="px-4 py-2 rounded-lg border border-[#2A2A2A] hover:bg-white/5 flex items-center gap-2 disabled:opacity-60"
            >
              <FiTrash2 />{" "}
              {deletingId ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {/* card */}
        <div className="rounded-lg border border-[#2A2A2A] p-6 bg-[#0f0f0f]">
          {/* Name + Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="text-sm text-[#d0d0d0] mb-2">Dish Name</div>
              <div className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3 text-[#cfcfcf]">
                {dish.name ?? "-"}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#d0d0d0] mb-2">Price</div>
              <div className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3 text-[#cfcfcf]">
                {dish.price != null ? dish.price : "-"}
              </div>
            </div>
          </div>

          {/* Taste / Category / Subcategory / Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <div className="text-sm text-[#d0d0d0] mb-2">Taste</div>
              <div className="rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2 text-[#cfcfcf]">
                {tasteText}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#d0d0d0] mb-2">Category</div>
              <div className="rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2 text-[#cfcfcf]">
                {categoryText}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#d0d0d0] mb-2">SubCategory</div>
              <div className="rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2 text-[#cfcfcf]">
                {subcategoryText}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#d0d0d0] mb-2">Status</div>
              <div className="rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2 text-[#cfcfcf] capitalize">
                {statusText}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-6">
            <div className="col-span-2">
              <div className="text-sm text-[#d0d0d0] mb-2">Dish Image</div>
              <div className="rounded-md border border-[#2A2A2A] h-24 flex items-center px-4 py-2 bg-[#181818]">
                {dish.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="object-cover h-20 rounded"
                  />
                ) : (
                  <div className="text-[#9a9a9a] flex items-center gap-2">
                    <FiImage /> No image
                  </div>
                )}
              </div>
            </div>

            <div className="h-24 w-24 rounded overflow-hidden border border-[#2A2A2A] bg-[#1a1a1a] flex items-center justify-center">
              {dish.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={dish.imageUrl}
                  alt="dish"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-[#6b6b6b] flex flex-col items-center gap-1">
                  <FiImage size={22} />
                  <div className="text-xs">No image</div>
                </div>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-6">
            <div className="text-sm text-[#d0d0d0] mb-2">Ingredients</div>
            <div className="rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3">
              {Array.isArray(dish.ingredients) && dish.ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dish.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-[#1b1b1b] rounded px-3 py-1 border border-[#2A2A2A] text-sm"
                    >
                      {ing}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#9a9a9a]">
                  No ingredients listed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* global overlay while deleting */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-[#ffb300] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#f5f5f5]">Deleting dish...</p>
          </div>
        </div>
      )}
    </div>
  );
}
