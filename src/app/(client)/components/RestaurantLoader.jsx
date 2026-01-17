"use client";

import Lottie from "lottie-react";
import loaderAnimation from "@/assets/lottie/chef-loader.json";

export default function RestaurantLoader({ text = "Loading menu..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-40 h-40">
        <Lottie
          animationData={loaderAnimation}
          loop
          autoplay
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
