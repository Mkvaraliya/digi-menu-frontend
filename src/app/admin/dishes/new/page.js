// src/app/admin/dishes/new/page.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiImage, FiSave } from "react-icons/fi";
import { apiAuthGet, apiAuthPost, apiAuthUpload } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://digi-menu-backend.onrender.com";

// const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AddDishPage() {
  const router = useRouter();

  // master lists from API
  const [categories, setCategories] = useState([]); // [{_id, name}]
  const [subcategories, setSubcategories] = useState([]); // for selected category
  const [tastes, setTastes] = useState([]); // [{_id, name}]

  // form state
  const [dishName, setDishName] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [price, setPrice] = useState("");
  const [selectedTaste, setSelectedTaste] = useState(""); // tasteId
  const [selectedCategory, setSelectedCategory] = useState(""); // categoryId
  const [selectedSubcategory, setSelectedSubcategory] = useState(""); // subcategoryId
  const [status, setStatus] = useState("available"); // "available" | "out_of_stock"
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [saving, setSaving] = useState(false);

  const imgInputRef = useRef(null);

  // ─────────────────────────────
  // Helpers
  // ─────────────────────────────
  const handleFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImgFile(f);
  };

  const previewURL = (file) => (file ? URL.createObjectURL(file) : null);

  const addIngredientFromInput = () => {
    const text = ingredientInput.trim();
    if (!text) return;
    setIngredients((s) => [...s, text]);
    setIngredientInput("");
  };

  const removeIngredient = (idx) => setIngredients((s) => s.filter((_, i) => i !== idx));

  const resetForm = () => {
    setDishName("");
    setImgFile(null);
    setPrice("");
    setSelectedTaste("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setStatus("available");
    setIngredients([]);
    setIngredientInput("");
    if (imgInputRef.current) imgInputRef.current.value = "";
  };

  // ─────────────────────────────
  // Load tastes + categories on mount
  // ─────────────────────────────
  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          apiAuthGet("/api/owner/tastes"),
          apiAuthGet("/api/owner/categories"),
        ]);
        setTastes(tRes.data || []);
        setCategories(cRes.data || []);
      } catch (err) {
        console.error("Failed to load taxonomies:", err);
        toast.error("Failed to load tastes/categories");
      }
    };

    loadTaxonomies();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        setSelectedSubcategory("");
        return;
      }

      try {
        const res = await apiAuthGet(`/api/owner/categories/${selectedCategory}/subcategories`);
        setSubcategories(res.data || []);
        setSelectedSubcategory("");
      } catch (err) {
        console.error("Failed to load subcategories:", err);
        toast.error("Failed to load subcategories");
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // ─────────────────────────────
  // Submit
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dishName.trim()) {
      toast.error("Please add dish name");
      return;
    }
    if (!price) {
      toast.error("Please set price");
      return;
    }
    if (!selectedCategory) {
      toast.error("Select category");
      return;
    }

    try {
      setSaving(true);

      // 1) Upload image if present (use centralized upload helper)
      let imageUrl = null;
      let imagePublicId = null;

      if (imgFile) {
        const formData = new FormData();
        // IMPORTANT: field name must match your upload middleware
        formData.append("image", imgFile);

        // use centralized apiAuthUpload so Authorization header is applied consistently
        const uploadJson = await apiAuthUpload("/api/owner/upload/dish-image", formData);

        // backend response shape: { success: true, data: { imageUrl, imagePublicId } }
        imageUrl = uploadJson.data?.imageUrl || null;
        imagePublicId = uploadJson.data?.imagePublicId || null;
      }

      // 2) Create dish
      const payload = {
        name: dishName.trim(),
        price: Number(price),
        tasteId: selectedTaste || null,
        categoryId: selectedCategory,
        subcategoryId: selectedSubcategory || null,
        ingredients,
        status, // "available" or "out_of_stock"
        imageUrl,
        imagePublicId,
      };

      const res = await apiAuthPost("/api/owner/dishes", payload);
      console.log("Dish created:", res);

      toast.success("Dish saved successfully");
      resetForm();

      // optional: small delay feels nicer with the toast
      setTimeout(() => {
        router.push("/admin/dishes");
      }, 600);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error saving dish");
    } finally {
      setSaving(false);
    }
  };

  const subForSelectedCategory = subcategories;

  return (
    <div className="bg-[#121212] min-h-screen px-6 py-6 text-white border border-[#2A2A2A] relative">
      {/* Full-screen loader overlay while saving */}
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-[#ffb300] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#f5f5f5]">Saving dish...</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Add New Dish</h2>

        <div className="rounded-lg border border-[#2A2A2A] p-6 bg-[#0f0f0f] mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name + Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="md:col-span-2">
                <div className="text-sm text-[#d0d0d0] mb-2">Dish Name</div>
                <input
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3"
                  placeholder="e.g. Spicy Paneer Tikka"
                />
              </label>

              <div>
                <div className="text-sm text-[#d0d0d0] mb-2">Price</div>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                  min="0"
                  className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3"
                  placeholder="e.g. 110"
                />
              </div>
            </div>

            {/* Taste / Category / Subcategory / Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Taste */}
              <div>
                <div className="text-sm text-[#d0d0d0] mb-2">Taste</div>
                <select
                  value={selectedTaste}
                  onChange={(e) => setSelectedTaste(e.target.value)}
                  className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                >
                  <option value="">-- Select Taste --</option>
                  {tastes.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <div className="text-sm text-[#d0d0d0] mb-2">Category</div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <div className="text-sm text-[#d0d0d0] mb-2">SubCategory</div>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                  disabled={!selectedCategory}
                >
                  <option value="">-- Select SubCategory --</option>
                  {subForSelectedCategory.map((sc) => (
                    <option key={sc._id} value={sc._1d ?? sc._id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <div className="text-sm text-[#d0d0d0] mb-2">Status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of stock</option>
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="col-span-2">
                <div className="text-sm text-[#d0d0d0] mb-2">Dish Image</div>
                <input
                  ref={imgInputRef}
                  onChange={handleFile}
                  type="file"
                  accept="image/*"
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#ffb300] file:text-black"
                />
              </div>

              <div className="h-24 w-24 rounded overflow-hidden border border-[#2A2A2A] bg-[#1a1a1a] flex items-center justify-center">
                {imgFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewURL(imgFile)} alt="dish" className="object-cover w-full h-full" />
                ) : (
                  <div className="text-[#6b6b6b] flex flex-col items-center gap-1">
                    <FiImage size={22} />
                    <div className="text-xs">No image</div>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients tag input */}
            <div>
              <div className="text-sm text-[#d0d0d0] mb-2">Ingredients</div>
              <div className="flex gap-2 mb-2">
                <input
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addIngredientFromInput();
                    }
                  }}
                  placeholder="Type ingredient and press Enter or comma"
                  className="flex-1 rounded bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                />
                <button type="button" onClick={addIngredientFromInput} className="px-3 py-2 rounded bg-[#ffb300] text-black">
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#1b1b1b] rounded px-3 py-1 border border-[#2A2A2A]">
                    <div className="text-sm">{ing}</div>
                    <button type="button" onClick={() => removeIngredient(i)} className="text-red-400">
                      ✕
                    </button>
                  </div>
                ))}
                {ingredients.length === 0 && <div className="text-xs text-[#9a9a9a]">No ingredients added</div>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={resetForm} disabled={saving} className="px-4 py-2 rounded-lg border border-[#2A2A2A] hover:bg-white/5 disabled:opacity-60">
                Reset
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#ffb300] text-black flex items-center gap-2 disabled:opacity-60">
                <FiSave />
                {saving ? "Saving..." : "Save Dish"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
