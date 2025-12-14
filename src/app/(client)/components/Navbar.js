// src/app/(client)/components/Navbar.js
"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/app/(client)/components/ui/button";
import { Badge } from "@/app/(client)/components/ui/badge";
import fallbackLogo from "@/assets/restaurant-logo.png";

const Navbar = ({ slug, restaurant }) => {
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();

  const logoSrc = restaurant?.logoUrl || fallbackLogo;
  const name = restaurant?.name || "Spice Garden";

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-opacity-90">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + name → go to current restaurant if slug, otherwise home */}
        <Link
          href={slug ? `/${slug}` : "/"}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Image
            src={logoSrc}
            alt={name}
            className="rounded-full"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {name}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {slug && (
            <Link
              href={`/${slug}/about`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              About
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-muted transition-colors"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <Link
            href={slug ? `/cart?slug=${slug}` : "/cart"}
            className="relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
