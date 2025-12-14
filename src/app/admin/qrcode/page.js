// app/dashboard/qrcode/page.js
"use client";

import React, { useEffect, useState } from "react";
import { FiDownload, FiRefreshCw, FiLink } from "react-icons/fi";
import { apiAuthGet } from "@/lib/apiClient"; // uses stored token
import { toast } from "sonner";

export default function QRPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dataUrl, setDataUrl] = useState(null);
  const [targetUrl, setTargetUrl] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  async function load() {
    try {
      setLoading(true);
      // call owner-only endpoint
      const res = await apiAuthGet("/api/owner/qrcode");
      setDataUrl(res.dataUrl || res.data?.dataUrl || res.data?.dataUrl || res.data?.dataUrl);
      setTargetUrl(res.url || res.data?.url || res.data?.url);
      setRestaurant(res.restaurant || res.data?.restaurant || null);
    } catch (err) {
      console.error("Failed to load QR:", err);
      toast.error(err.message || "Failed to load QR");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleDownload = () => {
    if (!dataUrl) return;
    // create a temporary link and click to download PNG
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${restaurant?.slug || "restaurant"}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyLink = async () => {
    if (!targetUrl) return toast.error("No link to copy");
    try {
      await navigator.clipboard.writeText(targetUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleRefresh = async () => {
    try {
      setGenerating(true);
      // Call same endpoint again — owner endpoint will generate again.
      const res = await apiAuthGet("/api/owner/qrcode");
      setDataUrl(res.dataUrl || res.data?.dataUrl);
      setTargetUrl(res.url || res.data?.url);
      setRestaurant(res.restaurant || res.data?.restaurant || null);
      toast.success("QR refreshed");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to refresh QR");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">QR Code</h2>

        <div className="rounded-lg bg-[#121212] border border-[#2A2A2A] p-6">
          {loading ? (
            <div className="text-sm text-[#cfcfcf]">Loading...</div>
          ) : (
            <>
              <div className="mb-4">
                <div className="text-sm text-[#9a9a9a] mb-2">Restaurant</div>
                <div className="text-lg font-medium">{restaurant?.name || "—"}</div>
                <div className="text-xs text-[#7a7a7a]">{restaurant?.slug}</div>
              </div>

              <div className="mb-6 flex flex-col items-center gap-3">
                {dataUrl ? (
                  <img
                    src={dataUrl}
                    alt="QR code"
                    className="w-64 h-64 bg-white p-2 rounded"
                  />
                ) : (
                  <div className="w-64 h-64 bg-[#0b0b0b] rounded flex items-center justify-center text-sm">
                    No QR generated
                  </div>
                )}

                {targetUrl && (
                  <div className="text-sm text-[#cfcfcf] break-words text-center">
                    {targetUrl}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded bg-[#ffb300] text-black flex items-center gap-2"
                >
                  <FiLink />
                  Copy Link
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!dataUrl}
                  className="px-3 py-2 rounded border border-[#2A2A2A] hover:bg-white/5 flex items-center gap-2"
                >
                  <FiDownload />
                  Download PNG
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={generating}
                  className="px-3 py-2 rounded border border-[#2A2A2A] hover:bg-white/5 flex items-center gap-2"
                >
                  <FiRefreshCw />
                  {generating ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
