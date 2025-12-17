"use client";

import Image from "next/image";
import fallbackLogo from "@/assets/restaurant-logo.png";

const Hero = ({ restaurant }) => {
  const heroSrc =
    restaurant?.heroImageUrl || restaurant?.logoUrl || fallbackLogo;
  const altText = restaurant?.name || "Restaurant hero image";

  return (
    <section className="relative w-full">
      <div className="relative w-full h-40 md:h-52 overflow-hidden">
        <Image
          src={heroSrc}
          alt={altText}
          fill
          sizes="100vw"
          className="object-fit"
          priority
        />
      </div>
    </section>
  );
};

export default Hero;
