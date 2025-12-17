"use client";

import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/(client)/components/ui/button";
import { Card } from "@/app/(client)/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function CartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  const slugFromCart = cart[0]?.slug || "";
  const slugFromQuery = searchParams.get("slug") || "";
  const currentSlug = slugFromCart || slugFromQuery;

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

  /* ───────── Reusable UI helpers ───────── */

  const CategoryPill = ({ label }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-600 text-xs font-semibold text-white">
      {label}
    </span>
  );

  const TasteText = ({ taste }) =>
    taste ? (
      <span className="text-xs font-bold capitalize text-primary">
        {taste}
      </span>
    ) : null;

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: ITEMS */}
          <div className="lg:col-span-2 space-y-6">
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
                        {/* Image */}
                        <div className="relative w-20 self-stretch flex-shrink-0">
                          <Image
                            src={item.image || "/assets/image-comming-soon.png"}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = "/assets/image-comming-soon.png";
                            }}
                          />

                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CategoryPill label={item.category} />
                              <TasteText taste={item.taste} />
                            </div>

                            <h3 className="font-semibold text-base leading-snug line-clamp-2">
                              {item.name}
                            </h3>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-2">
                            <span className="font-bold text-primary">
                              ₹{item.price}
                            </span>

                            <div className="flex items-center gap-2">
                              <div
                                className="flex items-center gap-1 bg-muted rounded-lg p-1"
                                onClick={(e) => e.stopPropagation()}
                              >

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, item.quantity - 1);
                                  }}
                                  className="h-7 w-7"
                                >

                                  <Minus className="h-4 w-4" />
                                </Button>

                                <span className="w-6 text-center font-semibold">
                                  {item.quantity}
                                </span>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, item.quantity + 1);
                                  }}
                                  className="h-7 w-7"
                                >

                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(item.id);
                                }}
                                className="h-7 w-7 text-destructive"
                              >

                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Line total */}
                        <div className="text-right font-bold self-end pb-1">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: SUMMARY */}
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
        </div>
      </div>
    </div>
  );
}
