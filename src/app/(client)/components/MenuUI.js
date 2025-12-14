// src/app/(client)/MenuUI.js  (or wherever this file lives)
"use client";

import { useState, useEffect } from "react";
import Hero from "@/app/(client)/components/Hero";
import SearchBar from "@/app/(client)/components/SearchBar";
import CategorySection from "@/app/(client)/components/CategorySection";
import DishGrid from "@/app/(client)/components/DishGrid";
import { apiGet } from "@/lib/apiClient";

export default function MenuUI({ restaurant, categories, dishes, slug }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // backend id
  const [selectedCategoryName, setSelectedCategoryName] = useState("all");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [filteredDishes, setFilteredDishes] = useState(dishes);
  const [loading, setLoading] = useState(false);

  // whenever filters change -> fetch from /api/menu/:slug/dishes
  useEffect(() => {
    async function fetchFiltered() {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
        if (selectedSubcategoryId)
          params.set("subcategoryId", selectedSubcategoryId);

        const query = params.toString();
        const url = query
          ? `/api/menu/${slug}/dishes?${query}`
          : `/api/menu/${slug}/dishes`;

        const res = await apiGet(url);
        setFilteredDishes(res.data.dishes);
      } catch (err) {
        console.error("Error fetching filtered dishes", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFiltered();
  }, [searchQuery, selectedCategoryId, selectedSubcategoryId, slug]);

  const handleSelectCategory = (categoryId, categoryName) => {
    if (categoryId === "all") {
      setSelectedCategoryId("");
      setSelectedCategoryName("all");
      setSelectedSubcategoryId("");
    } else {
      setSelectedCategoryId(categoryId);
      setSelectedCategoryName(categoryName);
      setSelectedSubcategoryId("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <Hero restaurant={restaurant} />

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <CategorySection
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedCategoryName={selectedCategoryName}
        selectedSubcategoryId={selectedSubcategoryId}
        onSelectCategory={handleSelectCategory}
        onSelectSubcategory={setSelectedSubcategoryId}
      />

      {loading ? (
        <div className="container mx-auto px-4 py-10 text-center text-muted-foreground">
          Loading dishes...
        </div>
      ) : (
        <DishGrid dishes={filteredDishes} slug={slug} />
      )}
    </div>
  );
}

{/* <Navbar>
<div className="h-screen flex-1 d-flex " ></div>

</Navbar> */}