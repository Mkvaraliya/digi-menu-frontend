"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/app/(client)/components/ui/button";
import { Badge } from "@/app/(client)/components/ui/badge";
import { Card } from "@/app/(client)/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { apiGet } from "@/lib/apiClient";

export default function DishDetailPage({ params }) {
  const { slug, dishId } = params; // from /[slug]/dish/[dishId]
  const router = useRouter();
  const { addToCart } = useCart();

  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Track restaurant active state explicitly when available
  const [restaurantActive, setRestaurantActive] = useState(true);
  const [restaurantInfo, setRestaurantInfo] = useState(null); // optional restaurant metadata

  // Fetch dish from API
  useEffect(() => {
    let mounted = true;
    async function fetchDish() {
      try {
        setLoading(true);
        setError("");
        // call backend
        const res = await apiGet(`/api/menu/${encodeURIComponent(slug)}/dish/${encodeURIComponent(dishId)}`);

        // backend shape may vary. Try common shapes:
        // 1) { success: true, data: { dish, restaurant, ... } }
        // 2) { success: true, dish: {...}, restaurant: {...} }
        // 3) { data: { dish: ... } }
        const payload = res?.data ?? res;

        // if backend included restaurant data, use it
        const restaurantFromRes = payload?.restaurant ?? payload?.data?.restaurant ?? payload?.restaurant;
        if (restaurantFromRes) {
          const isActive = (restaurantFromRes.active ?? restaurantFromRes.isActive ?? true);
          if (mounted) {
            setRestaurantActive(Boolean(isActive));
            setRestaurantInfo(restaurantFromRes);
          }
          if (!isActive) {
            // do not set dish, show inactive UI below
            if (mounted) {
              setDish(null);
            }
            return;
          }
        }

        // obtain dish object
        const dishObj = payload?.dish ?? payload?.data?.dish ?? payload;
        if (mounted) {
          setDish(dishObj || null);
        }
      } catch (err) {
        console.error("Failed to load dish", err);

        // If the backend returns a message that indicates inactivity, show the same UI
        const msg = (err && err.message) ? err.message.toString().toLowerCase() : "";
        if (msg.includes("inactive") || msg.includes("not available")) {
          setRestaurantActive(false);
          setError("");
        } else {
          setError(err?.message || "Failed to load dish");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDish();
    return () => {
      mounted = false;
    };
  }, [slug, dishId]);

  const handleAddToCart = () => {
    if (!dish) return;

    const imageSrc = dish.imageUrl || "/placeholder-dish.png";

    addToCart({
      id: dish._id || dish.id,
      name: dish.name,
      price: dish.price,
      image: imageSrc,
      category: dish.category || dish.categoryId?.name || "",
      slug,
    });
    toast.success(`${dish.name} added to cart!`);
  };

  // Loading state
  if (loading) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-lg">
        Loading dish...
      </p>
    </div>
  );
}


  // Restaurant inactive UI (same style as menu)
  if (!restaurantActive) {
    const name = restaurantInfo?.name ?? "This restaurant";
    const contact = restaurantInfo?.email ?? restaurantInfo?.phone ?? null;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">{name}</h1>
          <div className="inline-block bg-[#2A2A2A] p-6 rounded-lg">
            <p className="text-red-400 mb-2">This restaurant is currently inactive. Public menu is not available.</p>
            {contact && <p className="text-sm text-muted-foreground">Contact: {contact}</p>}
            <div className="mt-4">
              <Button onClick={() => router.push("/")}>Back to Home</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or dish not found
  if (error || !dish) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Dish not found</h1>
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          <Button onClick={() => router.push(`/${slug}`)}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  // use imageUrl from API, fallback for safety
 const imageSrc =
  dish.imageUrl ||
  "/assets/image-comming-soon.png";   // <-- your fallback image

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>

        {/* Main layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="animate-fade-in">
            <Image
              src={imageSrc}
              alt={dish.name}
              width={600}
              height={400}
              className="w-full h-[280px] md:h-[400px] object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="animate-fade-in-left">
            <div className="flex items-center gap-3 mb-4">
              {/* Category pill */}
              {(dish.category || dish.categoryId?.name) && (
                <Badge className="text-sm bg-emerald-600 text-white">
                  {dish.category || dish.categoryId?.name}
                </Badge>
              )}

              {/* Taste text */}
              {(dish.taste || dish.tasteId?.name) && (
                <span className="text-sm font-semibold capitalize text-primary">
                  {dish.taste || dish.tasteId?.name}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {dish.name}
            </h1>

            {/* Simple description from ingredients */}
            <p className="text-muted-foreground text-base md:text-lg mb-6">
              {dish.ingredients && dish.ingredients.length > 0
                ? `Made with ${dish.ingredients.join(", ")}.`
                : "Delicious dish prepared fresh for you."}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl md:text-4xl font-bold text-primary">
                ₹{dish.price}
              </span>

              <Button size="lg" onClick={handleAddToCart} className="gap-2">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Ingredients card (no tabs) */}
        <Card className="p-6 animate-scale-in">
          <h3 className="font-bold text-xl mb-4">Ingredients</h3>
          {dish.ingredients && dish.ingredients.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {dish.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              Ingredients information is not available.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
