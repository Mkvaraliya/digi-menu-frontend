"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/app/(client)/components/ui/button";
import { Card } from "@/app/(client)/components/ui/card";
import { apiGet } from "@/lib/apiClient";
import RestaurantLoader from "@/app/(client)/components/RestaurantLoader";

export default function AboutPage({ params }) {
  const { slug } = params;
  const router = useRouter();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoading(true);
        setError("");

        const res = await apiGet(`/api/menu/${slug}`);
        const r = res?.data?.restaurant || null;
        setRestaurant(r);
      } catch (err) {
        console.error("Failed to load restaurant", err);
        setError("Failed to load restaurant");
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchRestaurant();
  }, [slug]);

  // ✅ SAFE heroImages definition (FIX #1)
  const heroImages = restaurant?.heroImages || [];

  // ✅ Auto-slide
  useEffect(() => {
    if (!heroImages.length) return;

    const interval = setInterval(() => {
      setActiveHeroIndex((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [heroImages]);

  // ✅ Index safety (FIX #2)
  useEffect(() => {
    if (activeHeroIndex >= heroImages.length) {
      setActiveHeroIndex(0);
    }
  }, [heroImages, activeHeroIndex]);

  function to12Hour(timeStr) {
    if (!timeStr && timeStr !== "") return timeStr;

    const s = String(timeStr).trim();
    if (/[ap]\.?m\.?/i.test(s)) {
      return s
        .replace(/\./g, "")
        .replace(/\s+/g, " ")
        .toUpperCase();
    }

    const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!m) return s;

    let hh = parseInt(m[1], 10);
    const mm = m[2];
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12;

    return `${hh}:${mm} ${ampm}`;
  }

  if (loading) {
    return (
       <RestaurantLoader text="Restaurant Info Loading..." />
    );
  }

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

  const {
    name,
    address,
    phone,
    email,
    lunch,
    dinner,
    logoUrl,
    googleMapUrl,
    rules,
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

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${slug}`)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Menu
        </Button>

        <section className="mb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold">{name || "Restaurant"}</h1>
          </div>

         <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden mt-4 relative bg-muted">

            {heroImages.length > 0 ? (
              heroImages.map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  alt={`${name || "Restaurant"} hero ${index + 1}`}
                  fill
                  sizes="100vw"
                  className={`absolute inset-0 object-cover transition-opacity duration-700 ${
                    index === activeHeroIndex
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                  }`}
                />
              ))
            ) : logoUrl ? (
              <Image
                src={logoUrl}
                alt={name || "Restaurant logo"}
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

          {heroImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => setActiveHeroIndex(i)}
                  className={`w-2 h-2 rounded-full ${
                    i === activeHeroIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid md:grid-cols-2 gap-6">
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

        {Array.isArray(rules) && rules.length > 0 && (
          <div className="mt-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-3">
                Rules & Guidelines
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                {rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ol>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
