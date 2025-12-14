// src/app/[slug]/about/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/app/(client)/components/ui/button";
import { Card } from "@/app/(client)/components/ui/card";
import { apiGet } from "@/lib/apiClient";

export default function AboutPage({ params }) {
  const { slug } = params;
  const router = useRouter();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoading(true);
        setError("");

        // public menu endpoint – returns { success, data: { restaurant, categories, dishes } }
        const res = await apiGet(`/api/menu/${slug}`);

        const r = res?.data?.restaurant || null;
        setRestaurant(r);
        console.log("AboutPage restaurant =", r);
      } catch (err) {
        console.error("Failed to load restaurant", err);
        setError("Failed to load restaurant");
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchRestaurant();
    }
  }, [slug]);

  // helper: convert many common time formats to "h:mm AM/PM"
  function to12Hour(timeStr) {
    if (!timeStr && timeStr !== "") return timeStr;

    const s = String(timeStr).trim();

    // If already contains AM/PM (accept a.m./p.m. too), normalize punctuation and capitalization
    if (/[ap]\.?m\.?/i.test(s)) {
      return s
        .replace(/\./g, "")
        .replace(/\s+/g, " ")
        .toUpperCase()
        .replace(/\sAM/i, " AM")
        .replace(/\sPM/i, " PM");
    }

    // match HH:MM or H:MM or HH:MM:SS
    const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!m) {
      // fallback: return original string
      return s;
    }

    let hh = parseInt(m[1], 10);
    const mm = m[2];

    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12; // convert 0 -> 12, 13 -> 1 etc.

    return `${hh}:${mm} ${ampm}`;
  }

  // ─────────────────────────────
  // Loading state
  // ─────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">
            Loading restaurant info...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // Error / not found
  // ─────────────────────────────
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">
            Restaurant details not found
          </h1>
          <Button onClick={() => router.push(`/${slug}`)}>
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // Destructure based on current API shape
  // (coming from Restaurant + RestaurantInfo merged in menuController)
  // ─────────────────────────────
  const {
    name,
    address,
    phone,
    email,
    lunch, // { open, close }
    dinner, // { open, close }
    heroImageUrl,
    logoUrl,
    googleMapUrl,
  } = restaurant;

  const lunchText =
    lunch?.open && lunch?.close
      ? `${to12Hour(lunch.open)} – ${to12Hour(lunch.close)}`
      : "Not specified";

  const dinnerText =
    dinner?.open && dinner?.close
      ? `${to12Hour(dinner.open)} – ${to12Hour(dinner.close)}`
      : "Not specified";

  const mapsUrl =
    googleMapUrl ||
    (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address
        )}`
      : null);

  const heroSrc = heroImageUrl || logoUrl || null;

  // ─────────────────────────────
  // Normal UI
  // ─────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-6">
        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/${slug}`)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Menu
        </Button>

        {/* Hero + header block */}
        <section className="mb-6">
          {/* Full-width hero image */}
          <div className="w-full h-40 md:h-52 rounded-xl overflow-hidden mb-4 relative bg-muted">
            {heroSrc ? (
              <Image
                src={heroSrc}
                alt={name || "Restaurant hero image"}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                No hero image
              </div>
            )}
          </div>

          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold">{name || "Restaurant"}</h1>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact info */}
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Contact</h2>

            {phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </div>
            )}

            {address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p>{address}</p>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Timings */}
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Timings</h2>

            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Lunch</p>
                <p className="text-muted-foreground">{lunchText}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Dinner</p>
                <p className="text-muted-foreground">{dinnerText}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
