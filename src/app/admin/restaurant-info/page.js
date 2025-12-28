// src/app/admin/restaurant-info/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiImage, FiSave, FiTrash2 } from "react-icons/fi";
import { apiAuthGet, apiAuthPut, apiAuthUpload } from "@/lib/apiClient";
import { toast } from "sonner";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:4000";

// const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function RestaurantDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form fields
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroUrl, setHeroUrl] = useState("");
  const [address, setAddress] = useState("");
  const [lunchOpen, setLunchOpen] = useState("");
  const [lunchClose, setLunchClose] = useState("");
  const [dinnerOpen, setDinnerOpen] = useState("");
  const [dinnerClose, setDinnerClose] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [hideCartTotal, setHideCartTotal] = useState(false);


  // new files chosen by user
  const [logoFile, setLogoFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);

  // keep preview URLs in state so we can revoke them properly
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [heroPreviewUrl, setHeroPreviewUrl] = useState("");

  // refs to remember last created object urls to revoke
  const lastLogoObjectUrl = useRef(null);
  const lastHeroObjectUrl = useRef(null);

  // -------------------------------
  // Helpers: manage previews safely
  // -------------------------------
  useEffect(() => {
    if (logoFile) {
      if (lastLogoObjectUrl.current) {
        URL.revokeObjectURL(lastLogoObjectUrl.current);
        lastLogoObjectUrl.current = null;
      }
      const obj = URL.createObjectURL(logoFile);
      lastLogoObjectUrl.current = obj;
      setLogoPreviewUrl(obj);
    } else {
      if (lastLogoObjectUrl.current) {
        URL.revokeObjectURL(lastLogoObjectUrl.current);
        lastLogoObjectUrl.current = null;
      }
      setLogoPreviewUrl("");
    }

    return () => {
      if (lastLogoObjectUrl.current) {
        URL.revokeObjectURL(lastLogoObjectUrl.current);
        lastLogoObjectUrl.current = null;
      }
    };
  }, [logoFile]);

  useEffect(() => {
    if (heroFile) {
      if (lastHeroObjectUrl.current) {
        URL.revokeObjectURL(lastHeroObjectUrl.current);
        lastHeroObjectUrl.current = null;
      }
      const obj = URL.createObjectURL(heroFile);
      lastHeroObjectUrl.current = obj;
      setHeroPreviewUrl(obj);
    } else {
      if (lastHeroObjectUrl.current) {
        URL.revokeObjectURL(lastHeroObjectUrl.current);
        lastHeroObjectUrl.current = null;
      }
      setHeroPreviewUrl("");
    }

    return () => {
      if (lastHeroObjectUrl.current) {
        URL.revokeObjectURL(lastHeroObjectUrl.current);
        lastHeroObjectUrl.current = null;
      }
    };
  }, [heroFile]);

  // -------------------------------
  // Load saved restaurant info
  // -------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiAuthGet("/api/owner/restaurant-info");
        const r = res.data || {};

        setName(r.name || "");
        setLogoUrl(r.logoUrl || r.logo || "");
        setHeroUrl(r.heroImageUrl || r.heroUrl || "");
        setAddress(r.address || "");
        setPhone(r.phone || "");
        setEmail(r.email || "");
        setGoogleMapUrl(r.googleMapUrl || "");

        setLunchOpen(r.lunch?.open || "");
        setLunchClose(r.lunch?.close || "");
        setDinnerOpen(r.dinner?.open || "");
        setDinnerClose(r.dinner?.close || "");
        setHideCartTotal(
          typeof r.hideCartTotal === "boolean" ? r.hideCartTotal : false
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to load restaurant info");
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // -------------------------------
  // Upload helper (uses apiAuthUpload)
  // -------------------------------
  async function uploadImageUsingClient(file, endpoint) {
    // endpoint must be a full path relative to apiBase, e.g. "/api/owner/upload/restaurant-logo"
    const fd = new FormData();
    // NOTE: field name "image" — change to "file" if your multer expects "file"
    fd.append("image", file);

    const res = await apiAuthUpload(endpoint, fd);
    return res;
  }

  // -------------------------------
  // Save handler
  // -------------------------------
  async function handleSave(e) {
    e.preventDefault();

    if (!name.trim()) return toast.error("Restaurant name is required");
    if (!phone.trim()) return toast.error("Phone number is required");

    try {
      setSaving(true);

      let finalLogoUrl = logoUrl;
      let finalHeroUrl = heroUrl;

      // upload logo if changed
      if (logoFile) {
        const upload = await uploadImageUsingClient(
          logoFile,
          "/api/owner/upload/restaurant-logo"
        );
        finalLogoUrl = upload.data?.imageUrl || upload.data?.url || finalLogoUrl;
      }

      // upload hero image if changed
      if (heroFile) {
        const upload = await uploadImageUsingClient(
          heroFile,
          "/api/owner/upload/restaurant-hero"
        );
        finalHeroUrl = upload.data?.imageUrl || upload.data?.url || finalHeroUrl;
      }

      // now save restaurant info
      const payload = {
        name,
        logoUrl: finalLogoUrl,
        heroImageUrl: finalHeroUrl,
        phone,
        email,
        address,
        googleMapUrl,
        lunch: { open: lunchOpen, close: lunchClose },
        dinner: { open: dinnerOpen, close: dinnerClose },
        hideCartTotal,

      };

      await apiAuthPut("/api/owner/restaurant-info", payload);

      // update local state to show new remote urls after save
      setLogoUrl(finalLogoUrl);
      setHeroUrl(finalHeroUrl);
      setLogoFile(null);
      setHeroFile(null);

      toast.success("Restaurant details saved");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error saving restaurant details");
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------
  // Reset form
  // -------------------------------
  function handleReset() {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setGoogleMapUrl("");
    setLunchOpen("");
    setLunchClose("");
    setDinnerOpen("");
    setDinnerClose("");
    setLogoFile(null);
    setHeroFile(null);
    setLogoUrl("");
    setHeroUrl("");
  }

  if (loading) {
    return (
      <div className="bg-[#121212] flex items-center justify-center h-screen text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-[#ffb300] border-t-transparent animate-spin"></div>
          <p>Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  // fallback image shown when remote image fails
  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24'%3E%3Crect width='100%25' height='100%25' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' font-size='12' text-anchor='middle' dominant-baseline='central'%3EImage not available%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="bg-[#121212] m-0 border border-[#2A2A2A] min-h-screen px-6 py-6 text-white">
      <h2 className="text-xl font-semibold mb-6">Restaurant Details</h2>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[2.5fr_0.5fr] gap-6">
          {/* LEFT SIDE */}
          <div className="space-y-4">
            <label className="block">
              <div className="text-sm mb-2">Restaurant Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3"
              />
            </label>

            <label className="block">
              <div className="text-sm mb-2">Restaurant Address</div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
                className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3"
              />
            </label>

            <label className="block">
              <div className="text-sm mb-2">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3"
              />
            </label>

            <label className="block">
              <div className="text-sm mb-2">Phone</div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3"
              />
            </label>

            <label className="block">
              <div className="text-sm mb-2">Google Map URL</div>
              <input
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-4 py-3"
              />
            </label>

            {/* TIMINGS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm mb-2">Lunch Timing</div>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={lunchOpen}
                    onChange={(e) => setLunchOpen(e.target.value)}
                    className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                  />
                  <input
                    type="time"
                    value={lunchClose}
                    onChange={(e) => setLunchClose(e.target.value)}
                    className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <div className="text-sm mb-2">Dinner Timing</div>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={dinnerOpen}
                    onChange={(e) => setDinnerOpen(e.target.value)}
                    className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                  />
                  <input
                    type="time"
                    value={dinnerClose}
                    onChange={(e) => setDinnerClose(e.target.value)}
                    className="w-full rounded-lg bg-[#181818] border border-[#2A2A2A] px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* CART TOTAL VISIBILITY */}
            <div className="rounded-lg border border-[#2A2A2A] bg-[#0f0f0f] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Hide Total in Cart</p>
                  <p className="text-xs text-[#888] mt-1">
                    Enable to hide total amount on the cart page
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setHideCartTotal((prev) => !prev)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${hideCartTotal ? "bg-[#ffb300]" : "bg-[#444]"
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${hideCartTotal ? "translate-x-6" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE — IMAGES */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="rounded-lg border border-[#2A2A2A] bg-[#0f0f0f] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm">Restaurant Logo</span>
                <span className="text-xs text-[#888]">300×300 recommended</span>
              </div>

              <div className="flex gap-3 items-center">
                <div
                  className="w-24 h-24 border border-[#2A2A2A] bg-[#1a1a1a] rounded flex items-center justify-center overflow-hidden"
                  style={{ minWidth: 96, minHeight: 96 }}
                >
                  {logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Logo preview"
                      className="object-contain w-full h-full"
                      onError={handleImgError}
                    />
                  ) : logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="object-contain w-full h-full"
                      onError={handleImgError}
                    />
                  ) : (
                    <div className="text-center text-[#777] flex flex-col items-center gap-1 px-2">
                      <FiImage size={22} />
                      <span className="text-xs">No logo</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    setLogoFile(f || null);
                  }}
                  className="file:bg-[#ffb300] file:text-black file:rounded file:border-0 file:px-4 file:py-2 text-sm"
                />
              </div>
            </div>

            {/* Hero image */}
            <div className="rounded-lg border border-[#2A2A2A] bg-[#0f0f0f] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm">Hero Image</span>
                <span className="text-xs text-[#888]">1200×400 recommended</span>
              </div>

              <div className="h-32 rounded border border-[#2A2A2A] bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                {heroPreviewUrl ? (
                  <img
                    src={heroPreviewUrl}
                    alt="Hero preview"
                    className="object-cover w-full h-full"
                    onError={handleImgError}
                  />
                ) : heroUrl ? (
                  <img
                    src={heroUrl}
                    alt="Hero"
                    className="object-cover w-full h-full"
                    onError={handleImgError}
                  />
                ) : (
                  <div className="text-center text-[#777] flex flex-col items-center gap-1">
                    <FiImage size={22} />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  setHeroFile(f || null);
                }}
                className="mt-3 file:bg-[#ffb300] file:text-black file:px-4 file:py-2 file:rounded text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent border border-[#2A2A2A] hover:bg-white/10"
              >
                <FiTrash2 /> Reset
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffb300] text-black font-semibold hover:brightness-95 disabled:opacity-60"
              >
                <FiSave /> {saving ? "Saving..." : "Save Details"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-[#ffb300] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Saving...</p>
          </div>
        </div>
      )}
    </div>
  );
}
