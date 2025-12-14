// src/app/(client)/components/Hero.js
"use client";

import Image from "next/image";
import fallbackLogo from "@/assets/restaurant-logo.png";

const Hero = ({ restaurant }) => {
  const heroSrc =
    restaurant?.heroImageUrl || restaurant?.logoUrl || fallbackLogo;
  const altText = restaurant?.name || "Restaurant hero image";

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 py-4">
      <div className="container mx-auto px-4">
        <div className="w-full h-40 md:h-52 rounded-xl overflow-hidden relative shadow-md bg-muted">
          <Image
            src={heroSrc}
            alt={altText}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
