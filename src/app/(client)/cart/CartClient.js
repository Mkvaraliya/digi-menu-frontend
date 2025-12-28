"use client";

import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/(client)/components/ui/button";
import { Card } from "@/app/(client)/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";

export default function CartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  const slugFromCart = cart[0]?.slug || "";
  const slugFromQuery = searchParams.get("slug") || "";
  const currentSlug = slugFromCart || slugFromQuery;

  /* ✅ NEW: hide cart total flag */
  const [hideCartTotal, setHideCartTotal] = useState(null);

  /* ✅ Fetch restaurant info from about/menu API */
  useEffect(() => {
    if (!currentSlug) return;

    async function fetchRestaurantInfo() {
      try {
        const res = await apiGet(`/api/menu/${currentSlug}`);
        const hide =
          typeof res?.data?.restaurant?.hideCartTotal === "boolean"
            ? res.data.restaurant.hideCartTotal
            : false;

        setHideCartTotal(hide);
      } catch (err) {
        console.error("Failed to fetch restaurant info", err);
      }
    }

    fetchRestaurantInfo();
  }, [currentSlug]);

  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const CGST_RATE = 0.025;
  const SGST_RATE = 0.025;

  const cgstAmount = Math.round(cartTotal * CGST_RATE);
  const sgstAmount = Math.round(cartTotal * SGST_RATE);

  const grandTotal = cartTotal + cgstAmount + sgstAmount;

  const goToDish = (dishId) => {
    if (!currentSlug || !dishId) return;
    router.push(`/${currentSlug}/dish/${dishId}`);
  };

  /* ───────── Empty Cart ───────── */

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some delicious dishes to get started!
          </p>
          <Button
            onClick={() =>
              currentSlug ? router.push(`/${currentSlug}`) : router.push("/")
            }
          >
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  /* ───────── Cart UI ───────── */

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        <div className={`grid gap-8 ${hideCartTotal === true
            ? "lg:grid-cols-1"
            : hideCartTotal === false
              ? "lg:grid-cols-3"
              : "lg:grid-cols-1" // loading state
          }`}>

          {/* LEFT: ITEMS */}
          <div className={hideCartTotal ? "" : "lg:col-span-2 space-y-6"}>
            {Object.entries(groupedCart).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-bold mb-4 text-primary">
                  {category}
                </h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className="p-3 cursor-pointer hover:bg-muted/50 transition"
                      onClick={() => goToDish(item.id)}
                    >
                      <div className="flex items-stretch gap-3">
                        <div className="relative w-20 self-stretch flex-shrink-0">
                          <Image
                            src={item.image || "/assets/image-comming-soon.png"}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>

                        <div className="flex-1 flex flex-col">
                          <h3 className="font-semibold">{item.name}</h3>

                          <div className="mt-auto flex items-center justify-between pt-2">
                            <span className="font-bold text-primary">
                              ₹{item.price}
                            </span>
                          </div>
                        </div>

                        <div className="font-bold self-end pb-1">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ✅ RIGHT: SUMMARY (CONDITIONAL) */}
          {hideCartTotal === false && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>CGST @ 2.5%</span>
                    <span>₹{cgstAmount}</span>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>SGST @ 2.5%</span>
                    <span>₹{sgstAmount}</span>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{grandTotal}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
