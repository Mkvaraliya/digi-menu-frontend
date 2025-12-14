"use client";

import { useState, useMemo } from 'react';
import Navbar from '@/app/(client)/components/Navbar';
import Hero from '@/app/(client)/components/Hero';
import SearchBar from '@/app/(client)/components/SearchBar';
import CategorySection from '@/app/(client)/components/CategorySection';
import DishGrid from '@/app/(client)/components/DishGrid';
import { dishes } from '@/lib/data';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || dish.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategorySection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <DishGrid dishes={filteredDishes} />
    </div>
  );
};

export default Index;
