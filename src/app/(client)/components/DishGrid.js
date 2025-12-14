// src/components/DishGrid.js
'use client'; // required because of useState

import { useState } from "react";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/app/(client)/components/ui/button";
import DishCard from "./DishCard";

const DishGrid = ({ dishes, slug }) => {
  const [layout, setLayout] = useState("horizontal");

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Our Dishes</h2>
        <div className="flex gap-2">
          <Button
            variant={layout === "vertical" ? "default" : "outline"}
            size="icon"
            onClick={() => setLayout("vertical")}
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={layout === "horizontal" ? "default" : "outline"}
            size="icon"
            onClick={() => setLayout("horizontal")}
          >
            <LayoutList className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {dishes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No dishes found matching your search.
          </p>
        </div>
      ) : (
        <div
          className={
            layout === "vertical"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} layout={layout} slug={slug}/>
          ))}
        </div>
      )}
    </section>
  );
};

export default DishGrid;
