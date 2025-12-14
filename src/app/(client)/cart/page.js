"use client";

import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/(client)/components/ui/button";
import { Card } from "@/app/(client)/components/ui/card";
import Navbar from "@/app/(client)/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PublicFooter from "@/app/(client)/components/PublicFooter";

export default function Cart() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  // slug from first cart item (if cart has items)
  const slugFromCart = cart[0]?.slug || "";

  // slug from URL query (when cart is empty)
  const slugFromQuery = searchParams.get("slug") || "";

  // final slug to use for "Browse Menu"
  const currentSlug = slugFromCart || slugFromQuery;

  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

 if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* <Navbar /> */}
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
        {/* <PublicFooter /> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* <Navbar /> */}

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
          {/* LEFT: Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedCart).map(([category, items]) => (
              <div key={category} className="animate-fade-in">
                <h2 className="text-xl font-bold mb-4 text-primary">
                  {category}
                </h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex gap-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">
                            {item.name}
                          </h3>

                          <p className="text-primary font-bold mb-3">
                            ₹{item.price}
                          </p>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="h-8 w-8"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <span className="w-8 text-center font-semibold">
                                {item.quantity}
                              </span>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="h-8 w-8"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 animate-scale-in">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span>₹40</span>
                </div>

                <div className="h-px bg-border" />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{cartTotal + 40}
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      </div>
      {/* <PublicFooter /> */}
    </div>
  );
}
