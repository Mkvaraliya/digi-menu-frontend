// src/contexts/CartContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "app_cart";
const CART_EXPIRY_MS = 1 * 60 * 60 * 1000; // 24 hours

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [restaurantSlug, setRestaurantSlug] = useState(null);

  /* ───────── Load cart on app start ───────── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const { cart, restaurantSlug, timestamp } = parsed;

      // Expiry check
      if (!timestamp || Date.now() - timestamp > CART_EXPIRY_MS) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }

      setCart(cart || []);
      setRestaurantSlug(restaurantSlug || null);
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  }, []);

  /* ───────── Persist cart on change ───────── */
  useEffect(() => {
    if (cart.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        cart,
        restaurantSlug,
        timestamp: Date.now(),
      })
    );
  }, [cart, restaurantSlug]);

  /* ───────── Add to cart (with restaurant lock) ───────── */
  const addToCart = (item) => {
    setCart((prevCart) => {
      // Restaurant lock
      if (restaurantSlug && restaurantSlug !== item.slug) {
        const confirmClear = window.confirm(
          "Your cart contains items from another restaurant. Clear cart and add this item?"
        );

        if (!confirmClear) {
          return prevCart;
        }

        setRestaurantSlug(item.slug);
        return [{ ...item, quantity: 1 }];
      }

      if (!restaurantSlug) {
        setRestaurantSlug(item.slug);
      }

      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.id !== id);
      if (updated.length === 0) {
        setRestaurantSlug(null);
      }
      return updated;
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setRestaurantSlug(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        restaurantSlug,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
