import { Suspense } from "react";
import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <Suspense fallback={<CartLoading />}>
      <CartClient />
    </Suspense>
  );
}

function CartLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-lg">
        Loading cart...
      </p>
    </div>
  );
}