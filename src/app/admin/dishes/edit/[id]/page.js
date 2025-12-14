// src/app/admin/dishes/edit/[id]/page.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiImage, FiSave, FiArrowLeft } from "react-icons/fi";
import { useRouter, useParams } from "next/navigation";
import { apiAuthGet, apiAuthPut, apiAuthUpload } from "@/lib/apiClient";
import { toast } from "sonner";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://digi-menu-backend.onrender.com";

// const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function EditDishPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // taxonomies
  const [categories, setCategories] = useState([]); // [{_id, name}]
  const [subcategories, setSubcategories] = useState([]); // for selected category
  const [tastes, setTastes] = useState([]); // [{_id, name}]

  // dish + form state
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [dishName, setDishName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedTaste, setSelectedTaste] = useState(""); // tasteId
  const [selectedCategory, setSelectedCategory] = useState(""); // categoryId
  const [selectedSubcategory, setSelectedSubcategory] = useState(""); // subcategoryId
  const [status, setStatus] = useState("available"); // available | out_of_stock
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");

  const [imgFile, setImgFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // preview / existing
  const [imagePublicId, setImagePublicId] = useState(null);

  // to correctly set initial subcategory after it loads
  const [initialSubcategoryId, setInitialSubcategoryId] = useState("");

  const imgInputRef = useRef(null);

  // ─────────────────────────────
  // Helpers
  // ─────────────────────────────
  const handleFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    setImgFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setImageUrl(url);
    }
  };

  const addIngredientFromInput = () => {
    const t = ingredientInput.trim();
    if (!t) return;
    setIngredients((s) => [...s, t]);
    setIngredientInput("");
  };

  const removeIngredient = (idx) =>
    setIngredients((s) => s.filter((_, i) => i !== idx));

  const resetForm = () => {
    // restore from original dish
    if (!dish) return;
    fillFormFromDish(dish);
  };

  const handleBack = () => router.push("/admin/dishes");

  const fillFormFromDish = (data) => {
    setDishName(data.name ?? "");
    setPrice(data.price ?? "");
    setStatus(data.status || "available");
    setIngredients(Array.isArray(data.ingredients) ? data.ingredients : []);

    const imgUrl = data.imageUrl ?? null;
    setImageUrl(imgUrl);
    setImagePublicId(data.imagePublicId ?? null);
    setImgFile(null);
    if (imgInputRef.current) imgInputRef.current.value = "";

    setSelectedTaste(data.tasteId?._id || "");
    setSelectedCategory(data.categoryId?._id || "");
    setInitialSubcategoryId(data.subcategoryId?._id || "");
    setSelectedSubcategory(""); // will be set after subcategories are fetched
  };

  // ─────────────────────────────
  // Load taxonomies on mount
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

  // ─────────────────────────────
  // Load dish
  // ─────────────────────────────
  useEffect(() => {
    if (!id) {
      setError("Missing dish id in route");
      setLoading(false);
      return;
    }

    const loadDish = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiAuthGet(`/api/owner/dishes/${id}`);
        const data = res.data;
        setDish(data);
        fillFormFromDish(data);
      } catch (err) {
        console.error("Failed to load dish:", err);
        setError(err.message || "Failed to load dish");
        toast.error("Failed to load dish");
      } finally {
        setLoading(false);
      }
    };

    loadDish();
  }, [id]);

  // ─────────────────────────────
  // Load subcategories whenever category changes
  // ─────────────────────────────
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategories([]);
        setSelectedSubcategory("");
        return;
      }

      try {
        const res = await apiAuthGet(
          `/api/owner/categories/${selectedCategory}/subcategories`
        );
        setSubcategories(res.data || []);
      } catch (err) {
        console.error("Failed to load subcategories:", err);
        toast.error("Failed to load subcategories");
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  // After subcategories load, if we had an initial one, set it
  useEffect(() => {
    if (!initialSubcategoryId || subcategories.length === 0) return;

    const exists = subcategories.some((sc) => sc._id === initialSubcategoryId);
    if (exists) {
      setSelectedSubcategory(initialSubcategoryId);
    }
    setInitialSubcategoryId("");
  }, [subcategories, initialSubcategoryId]);

  // ─────────────────────────────
  // Submit (update dish)
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dishName.trim()) {
      toast.error("Dish name is required");
      return;
    }
    if (!price) {
      toast.error("Price is required");
      return;
    }
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    try {
      setSaving(true);

      // 1) if new image selected, upload it using apiAuthUpload
      let finalImageUrl = imageUrl;
      let finalImagePublicId = imagePublicId;

      if (imgFile) {
        const formData = new FormData();
        formData.append("image", imgFile);

        // Use apiAuthUpload so Authorization header is attached and Content-Type is NOT set manually
        const uploadJson = await apiAuthUpload("/api/owner/upload/dish-image", formData);
        finalImageUrl = uploadJson.data?.imageUrl || null;
        finalImagePublicId = uploadJson.data?.imagePublicId || null;
      }

      // 2) Build payload using IDs (backend expects tasteId, categoryId, subcategoryId)
      const payload = {
        name: dishName.trim(),
        price: Number(price),
        tasteId: selectedTaste || null,
        categoryId: selectedCategory,
        subcategoryId: selectedSubcategory || null,
        ingredients,
        status, // "available" | "out_of_stock"
        imageUrl: finalImageUrl,
        imagePublicId: finalImagePublicId,
      };

      await apiAuthPut(`/api/owner/dishes/${id}`, payload);

      toast.success("Dish updated successfully");
      router.push("/admin/dishes");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Error updating dish");
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="px-3 py-2 rounded-lg border border-[#2A2A2A] hover:bg-white/5 flex items-center gap-2 text-sm"
              >
                <FiArrowLeft />
                Back
              </button>
              <h2 className="text-xl font-semibold">Edit Dish</h2>
            </div>
          </div>

          <div className="rounded-lg border border-[#2A2A2A] p-6 bg-[#0f0f0f]">
            <div className="text-red-400 mb-3">{error || "Dish not found"}</div>
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-[#2A2A2A] hover:bg-white/5"
            >
              Go back to list
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subForSelectedCategory = subcategories;

  // ─────────────────────────────
  // Main form
  // ─────────────────────────────
  return (
    <div className="bg-[#121212] min-h-screen px-6 py-6 text-white border border-[#2A2A2A]">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-3 py-2 rounded-lg border border-[#2A2A2A] hover:bg-white/5 flex items-center gap-2 text-sm"
            >
              <FiArrowLeft />
              Back
            </button>
            <h2 className="text-xl font-semibold">Edit Dish</h2>
          </div>
        </div>

        <div className="rounded-lg border border-[#2A2A2A] p-6 bg-[#0f0f0f]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* name + price */}
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

            {/* taste / category / subcategory / status */}
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
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory("");
                  }}
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
                    <option key={sc._id} value={sc._id}>
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

            {/* Image */}
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
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="dish" className="object-cover w-full h-full" />
                ) : (
                  <div className="text-[#6b6b6b] flex flex-col items-center gap-1">
                    <FiImage size={22} />
                    <div className="text-xs">No image</div>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
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
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-[#2A2A2A] hover:bg-white/5">
                Reset
              </button>

              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#ffb300] text-black flex items-center gap-2 disabled:opacity-60">
                <FiSave />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* overlay while saving */}
      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-[#ffb300] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#f5f5f5]">Updating dish...</p>
          </div>
        </div>
      )}
    </div>
  );
}
