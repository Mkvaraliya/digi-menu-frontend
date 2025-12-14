// src/app/admin/menu-setup/page.js
"use client";

import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  apiAuthGet,
  apiAuthPost,
  apiAuthDelete,
} from "@/lib/apiClient";
import { toast } from "sonner";

export default function MenuSetupPage() {
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);       // [{ _id, name }]
  const [tastes, setTastes] = useState([]);               // [{ _id, name }]
  const [subcategories, setSubcategories] = useState([]); // [{ _id, name, categoryId }]

  // form inputs
  const [newCategory, setNewCategory] = useState("");
  const [newTaste, setNewTaste] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newSubParent, setNewSubParent] = useState("");   // category _id

  // per-action loading flags
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingTaste, setSavingTaste] = useState(false);
  const [savingSubcategory, setSavingSubcategory] = useState(false);

  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [deletingTasteId, setDeletingTasteId] = useState(null);
  const [deletingSubcategoryId, setDeletingSubcategoryId] = useState(null);

  // ─────────────────────────────────
  // Initial load
  // ─────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        // 1) categories + tastes
        const [catRes, tasteRes] = await Promise.all([
          apiAuthGet("/api/owner/categories"),
          apiAuthGet("/api/owner/tastes"),
        ]);

        const catData = catRes.data || [];
        const tasteData = tasteRes.data || [];

        setCategories(catData);
        setTastes(tasteData);

        // default parent for new subcategory selector
        if (catData.length > 0) setNewSubParent(catData[0]._id || "");

        // 2) subcategories for each category (flattened)
        const subArrays = await Promise.all(
          catData.map((c) =>
            apiAuthGet(`/api/owner/categories/${c._id}/subcategories`)
              .then((r) => r.data || [])
              .catch(() => [])
          )
        );
        const allSubs = subArrays.flat();
        setSubcategories(allSubs);
      } catch (err) {
        console.error("Failed to load menu setup:", err);
        toast.error(err.message || "Failed to load menu setup");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // convenience lookup
  const getCategoryName = (categoryId) =>
    categories.find((c) => String(c._id) === String(categoryId))?.name ||
    "Unknown";

  // ─────────────────────────────────
  // CATEGORY handlers
  // ─────────────────────────────────
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;

    try {
      setSavingCategory(true);
      const res = await apiAuthPost("/api/owner/categories", { name });
      const created = res.data || res.category || res;

      setCategories((prev) => [...prev, created]);
      if (!newSubParent) setNewSubParent(created._id);
      setNewCategory("");
      toast.success("Category added");
    } catch (err) {
      console.error("Add category failed:", err);
      toast.error(err.message || "Failed to add category");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Delete this category and its subcategories? This cannot be undone."
      )
    )
      return;

    try {
      setDeletingCategoryId(categoryId);
      await apiAuthDelete(`/api/owner/categories/${categoryId}`);

      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      setSubcategories((prev) =>
        prev.filter((sc) => String(sc.categoryId) !== String(categoryId))
      );

      // adjust parent selection if needed
      if (newSubParent === categoryId) {
        const remaining = categories.filter((c) => c._id !== categoryId);
        setNewSubParent(remaining[0]?._id || "");
      }

      toast.success("Category deleted");
    } catch (err) {
      console.error("Delete category failed:", err);
      toast.error(err.message || "Failed to delete category");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // ─────────────────────────────────
  // TASTE handlers
  // ─────────────────────────────────
  const handleAddTaste = async () => {
    const name = newTaste.trim();
    if (!name) return;

    try {
      setSavingTaste(true);
      const res = await apiAuthPost("/api/owner/tastes", { name });
      const created = res.data || res.taste || res;

      setTastes((prev) => [...prev, created]);
      setNewTaste("");
      toast.success("Taste added");
    } catch (err) {
      console.error("Add taste failed:", err);
      toast.error(err.message || "Failed to add taste");
    } finally {
      setSavingTaste(false);
    }
  };

  const handleDeleteTaste = async (tasteId) => {
    if (!window.confirm("Delete this taste?")) return;

    try {
      setDeletingTasteId(tasteId);
      await apiAuthDelete(`/api/owner/tastes/${tasteId}`);
      setTastes((prev) => prev.filter((t) => t._id !== tasteId));
      toast.success("Taste deleted");
    } catch (err) {
      console.error("Delete taste failed:", err);
      toast.error(err.message || "Failed to delete taste");
    } finally {
      setDeletingTasteId(null);
    }
  };

  // ─────────────────────────────────
  // SUBCATEGORY handlers
  // ─────────────────────────────────
  const handleAddSubcategory = async () => {
    const name = newSubcategory.trim();
    if (!name || !newSubParent) return;

    try {
      setSavingSubcategory(true);
      const res = await apiAuthPost(
        `/api/owner/categories/${newSubParent}/subcategories`,
        { name }
      );
      const created = res.data || res.subcategory || res;

      setSubcategories((prev) => [...prev, created]);
      setNewSubcategory("");
      toast.success("Subcategory added");
    } catch (err) {
      console.error("Add subcategory failed:", err);
      toast.error(err.message || "Failed to add subcategory");
    } finally {
      setSavingSubcategory(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!window.confirm("Delete this subcategory?")) return;

    try {
      setDeletingSubcategoryId(subcategoryId);
      await apiAuthDelete(`/api/owner/subcategories/${subcategoryId}`);
      setSubcategories((prev) => prev.filter((s) => s._id !== subcategoryId));
      toast.success("Subcategory deleted");
    } catch (err) {
      console.error("Delete subcategory failed:", err);
      toast.error(err.message || "Failed to delete subcategory");
    } finally {
      setDeletingSubcategoryId(null);
    }
  };

  // ─────────────────────────────────
  // UI
  // ─────────────────────────────────

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#ffb300] border-t-transparent animate-spin" />
          <p className="text-sm text-[#f5f5f5]">Loading menu setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen px-6 py-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Menu Setup</h2>

        {/* Layout: left = Categories + Tastes, right = Subcategories */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT: categories + tastes */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Categories manager */}
            <div className="rounded-lg border border-[#2A2A2A] p-4 bg-[#0f0f0f] min-h-[160px] flex flex-col">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-[#d0d0d0] font-semibold">
                    Manage Categories
                  </div>
                  <div className="text-xs text-[#9a9a9a]">Add / Delete</div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category"
                    className="flex-1 rounded bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={savingCategory}
                    className="px-3 py-2 rounded bg-[#ffb300] text-black flex items-center gap-2 disabled:opacity-60"
                  >
                    <FiPlus />
                    {savingCategory ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>

              <div className="mt-2 overflow-auto">
                <div className="space-y-2 max-h-40">
                  {categories.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between bg-[#121212] px-3 py-2 rounded"
                    >
                      <div className="text-sm">{c.name}</div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c._id)}
                        className="text-red-400 hover:text-red-500 disabled:opacity-50"
                        disabled={deletingCategoryId === c._id}
                        title="Delete category"
                      >
                        {deletingCategoryId === c._id ? (
                          <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-xs text-[#9a9a9a]">
                      No categories yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tastes manager */}
            <div className="rounded-lg border border-[#2A2A2A] p-4 bg-[#0f0f0f] min-h-[160px] flex flex-col">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-[#d0d0d0] font-semibold">
                    Manage Tastes
                  </div>
                  <div className="text-xs text-[#9a9a9a]">Add / Delete</div>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    value={newTaste}
                    onChange={(e) => setNewTaste(e.target.value)}
                    placeholder="New taste"
                    className="flex-1 rounded bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddTaste}
                    disabled={savingTaste}
                    className="px-3 py-2 rounded bg-[#ffb300] text-black flex items-center gap-2 disabled:opacity-60"
                  >
                    <FiPlus />
                    {savingTaste ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>

              <div className="mt-2 overflow-auto">
                <div className="space-y-2 max-h-40">
                  {tastes.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between bg-[#121212] px-3 py-2 rounded"
                    >
                      <div className="text-sm">{t.name}</div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTaste(t._id)}
                        className="text-red-400 hover:text-red-500 disabled:opacity-50"
                        disabled={deletingTasteId === t._id}
                        title="Delete taste"
                      >
                        {deletingTasteId === t._id ? (
                          <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  ))}
                  {tastes.length === 0 && (
                    <div className="text-xs text-[#9a9a9a]">
                      No tastes yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: subcategories */}
          <div className="lg:col-span-2 rounded-lg border border-[#2A2A2A] p-4 bg-[#0f0f0f] min-h-[340px] flex flex-col">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-[#d0d0d0] font-semibold">
                  Manage SubCategories
                </div>
                <div className="text-xs text-[#9a9a9a]">Add / Delete</div>
              </div>

              <div className="flex gap-2 mb-3">
                <select
                  value={newSubParent}
                  onChange={(e) => setNewSubParent(e.target.value)}
                  className="rounded bg-[#181818] border border-[#2A2A2A] px-2 py-2"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="">No categories</option>
                  )}
                </select>

                <input
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="New subcategory"
                  className="flex-1 rounded bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                />

                <button
                  type="button"
                  onClick={handleAddSubcategory}
                  disabled={savingSubcategory || !newSubParent}
                  className="px-3 py-2 rounded bg-[#ffb300] text-black flex items-center gap-2 disabled:opacity-60"
                >
                  <FiPlus />
                  {savingSubcategory ? "Adding..." : "Add"}
                </button>
              </div>
            </div>

            <div className="mt-2 overflow-auto">
              <div className="space-y-2 max-h-72">
                {subcategories.map((sc) => (
                  <div
                    key={sc._id}
                    className="flex items-center justify-between bg-[#121212] px-3 py-2 rounded"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{sc.name}</div>
                      <div className="text-xs text-[#9a9a9a]">
                        {getCategoryName(sc.categoryId)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubcategory(sc._id)}
                      className="text-red-400 hover:text-red-500 disabled:opacity-50"
                      disabled={deletingSubcategoryId === sc._id}
                      title="Delete subcategory"
                    >
                      {deletingSubcategoryId === sc._id ? (
                        <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiTrash2 />
                      )}
                    </button>
                  </div>
                ))}
                {subcategories.length === 0 && (
                  <div className="text-xs text-[#9a9a9a]">
                    No subcategories yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
