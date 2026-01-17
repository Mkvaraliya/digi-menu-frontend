"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Card } from "@/app/(client)/components/ui/card";
import { Button } from "@/app/(client)/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const DishCard = ({ dish, layout = "horizontal", slug }) => {
  const router = useRouter();
  const { addToCart } = useCart();

  // use imageUrl from API, fallback for safety
  const imageSrc =
    dish.imageUrl ||
    dish.image ||
    "/assets/image-comming-soon.png";   // <-- your fallback image



  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image: imageSrc,
      category: dish.category,
      taste: dish.taste,
      slug,             
    });
    toast.success(`${dish.name} added to cart!`);
  };

  const handleClick = () => {
    router.push(`/${slug}/dish/${dish.id}`);
  };


  const CategoryPill = () => (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-900 text-xs font-semibold text-white">
      {dish.category || "Dish"}
    </span>
  );

  const TasteText = () =>
    dish.taste ? (
      <span className="text-sm font-bold capitalize text-primary">
        {dish.taste}
      </span>
    ) : null;


  // HORIZONTAL LAYOUT (like your screenshot)
  if (layout === "horizontal") {
    return (
      <Card
        onClick={handleClick}
        className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] animate-fade-in"
      >
        <div className="flex items-stretch">
          <div className="relative w-24 self-stretch flex-shrink-0">
            <Image src={imageSrc} alt={dish.name} fill className="object-cover" />
          </div>
          <div className="flex-1 px-3 py-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CategoryPill />
                {/* <GravyPill /> */}
                <TasteText />
              </div>
              <h3 className="font-bold text-lg leading-snug line-clamp-2">
                {dish.name}
              </h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">
                ₹{dish.price}
              </span>
              <Button size="sm" onClick={handleAddToCart} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // VERTICAL CARD
  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] animate-fade-in"
    >
      <div className="relative w-full h-48">
        <Image src={imageSrc} alt={dish.name} fill className="object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CategoryPill />
          <TasteText />
        </div>
        <h3 className="font-bold text-lg mb-2">{dish.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ₹{dish.price}
          </span>
          <Button size="sm" onClick={handleAddToCart} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DishCard;
