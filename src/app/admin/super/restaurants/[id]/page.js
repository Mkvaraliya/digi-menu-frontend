"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Paper,
  Typography,
  Divider,
  IconButton,
  Switch,
  Tooltip,
  FormControlLabel,
  Chip,
  Grid,
} from "@mui/material";
import { FiEdit2, FiArrowLeft, FiLogIn, FiMapPin, FiMail, FiPhone, FiCalendar, FiUser } from "react-icons/fi";
import { apiAuthGet, apiAuthPut, apiAuthPost } from "@/lib/apiClient";
import { toast } from "sonner";

export default function ViewRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchRestaurant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const res = await apiAuthGet(`/api/super-admin/restaurant/${id}`);
      if (!res || res.success === false) throw new Error(res?.message || "Failed to fetch");
      setRestaurant(res.data);
    } catch (err) {
      console.error("fetchRestaurant error:", err);
      toast.error(err.message || "Failed to load restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async () => {
    try {
      if (!confirm("Impersonate this owner? You will be logged in as the owner.")) return;
      setBusy(true);
      const res = await apiAuthPost(`/api/super-admin/restaurant/${id}/impersonate`, {});
      if (!res || res.success === false) throw new Error(res?.message || "Failed to impersonate");
      const token = res.token || (res.data && res.data.token);
      if (!token) throw new Error("No token received");
      localStorage.setItem("token", token);
      localStorage.setItem("impersonation", "1");
      toast.success("Impersonation token received — redirecting to owner UI...");
      window.location.href = "/owner";
    } catch (err) {
      console.error("impersonate error:", err);
      toast.error(err.message || "Failed to impersonate");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async () => {
    if (!restaurant) return;
    const newActive = !restaurant.active;
    if (!confirm(`Are you sure you want to ${newActive ? "activate" : "deactivate"} this restaurant?`)) return;
    try {
      setBusy(true);
      const res = await apiAuthPut(`/api/super-admin/restaurant/${id}`, { active: newActive });
      if (!res || res.success === false) throw new Error(res?.message || "Failed to update");
      setRestaurant(res.data || { ...restaurant, active: newActive });
      toast.success(`Restaurant ${newActive ? "activated" : "deactivated"}`);
    } catch (err) {
      console.error("toggleActive error:", err);
      toast.error(err.message || "Failed to update active");
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: "#121212", minHeight: "70vh", p: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ color: "#9E9E9E" }}>Loading...</Typography>
      </Box>
    );
  }

  if (!restaurant) {
    return (
      <Box sx={{ bgcolor: "#121212", minHeight: "70vh", p: 4 }}>
        <Typography sx={{ color: "#f44336", mb: 2 }}>Restaurant not found.</Typography>
        <Button 
          variant="outlined" 
          onClick={() => router.push("/admin/super/restaurants")}
          sx={{ color: "#fff", borderColor: "#333" }}
        >
          Back to list
        </Button>
      </Box>
    );
  }

  const owner = restaurant.ownerId || {};

  return (
    <Box sx={{ bgcolor: "#121212", minHeight: "70vh", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Link href="/admin/super/restaurants">
            <Button 
              variant="outlined" 
              startIcon={<FiArrowLeft />} 
              sx={{ 
                color: "#fff", 
                borderColor: "#333",
                "&:hover": {
                  borderColor: "#555",
                  bgcolor: "#1E1E1E",
                }
              }}
            >
              Back to Restaurants
            </Button>
          </Link>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Edit Restaurant">
              <IconButton 
                onClick={() => router.push(`/admin/super/restaurants/edit/${id}`)}
                sx={{ 
                  color: "#FF9800",
                  bgcolor: "#1E1E1E",
                  "&:hover": { bgcolor: "#2A2A2A" }
                }}
              >
                <FiEdit2 />
              </IconButton>
            </Tooltip>

            <Tooltip title="Impersonate Owner">
              <span>
                <IconButton 
                  disabled={busy} 
                  onClick={handleImpersonate}
                  sx={{ 
                    color: "#1976d2",
                    bgcolor: "#1E1E1E",
                    "&:hover": { bgcolor: "#2A2A2A" },
                    "&:disabled": { color: "#555" }
                  }}
                >
                  <FiLogIn />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Restaurant Name & Status */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 600 }}>
            {restaurant.name}
          </Typography>
          <Chip 
            label={restaurant.active ? "Active" : "Inactive"}
            size="small"
            sx={{
              bgcolor: restaurant.active ? "#00C95133" : "#f4433633",
              color: restaurant.active ? "#00C951" : "#f44336",
              fontWeight: 600,
              border: `1px solid ${restaurant.active ? "#00C951" : "#f44336"}`,
            }}
          />
        </Box>
        <Typography sx={{ color: "#9E9E9E", fontSize: 14 }}>
          Slug: <span style={{ color: "#fff" }}>{restaurant.slug}</span>
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Restaurant Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: "#1E1E1E", height: "100%" }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
              Restaurant Details
            </Typography>
            <Divider sx={{ mb: 2, borderColor: "#333" }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Email */}
              {restaurant.email && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <FiMail size={20} style={{ color: "#9E9E9E", marginTop: 2 }} />
                  <Box>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>Email</Typography>
                    <Typography sx={{ color: "#fff" }}>{restaurant.email}</Typography>
                  </Box>
                </Box>
              )}

              {/* Phone */}
              {restaurant.phone && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <FiPhone size={20} style={{ color: "#9E9E9E", marginTop: 2 }} />
                  <Box>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>Phone</Typography>
                    <Typography sx={{ color: "#fff" }}>{restaurant.phone}</Typography>
                  </Box>
                </Box>
              )}

              {/* Address */}
              {(restaurant.address || restaurant.city) && (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <FiMapPin size={20} style={{ color: "#9E9E9E", marginTop: 2 }} />
                  <Box>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>Address</Typography>
                    <Typography sx={{ color: "#fff" }}>
                      {restaurant.address || "-"}
                      {restaurant.city && `, ${restaurant.city}`}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Status Toggle */}
              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #333" }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={restaurant.active} 
                      onChange={handleToggleActive}
                      disabled={busy}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#00C951",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#00C951",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: "#fff" }}>
                      {restaurant.active ? "Active (Public menu visible)" : "Inactive (Public menu hidden)"}
                    </Typography>
                  }
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Billing & Owner */}
        <Grid item xs={12} md={6}>
          {/* Billing Section */}
          <Paper sx={{ p: 3, bgcolor: "#1E1E1E", mb: 3 }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
              Billing Information
            </Typography>
            <Divider sx={{ mb: 2, borderColor: "#333" }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Plan Buy Date */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <FiCalendar size={20} style={{ color: "#9E9E9E", marginTop: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>Plan Purchase Date</Typography>
                  <Typography sx={{ color: "#fff" }}>{formatDate(restaurant.planBuyDate)}</Typography>
                </Box>
              </Box>

              {/* Next Yearly Due */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <FiCalendar size={20} style={{ color: "#9E9E9E", marginTop: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>Next Yearly Due Date</Typography>
                  <Typography sx={{ color: "#fff" }}>{formatDate(restaurant.nextYearlyDueDate)}</Typography>
                </Box>
              </Box>

              {/* Payment Status */}
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Box sx={{ flex: 1, bgcolor: "#252525", p: 2, borderRadius: 2 }}>
                  <Typography sx={{ color: "#9E9E9E", fontSize: 12, mb: 1 }}>Setup Fee</Typography>
                  <Chip 
                    label={restaurant.setupFeeStatus === "paid" ? "Paid" : "Pending"}
                    size="small"
                    sx={{
                      bgcolor: restaurant.setupFeeStatus === "paid" ? "#00C95133" : "#FF980033",
                      color: restaurant.setupFeeStatus === "paid" ? "#00C951" : "#FF9800",
                      fontWeight: 600,
                      border: `1px solid ${restaurant.setupFeeStatus === "paid" ? "#00C951" : "#FF9800"}`,
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1, bgcolor: "#252525", p: 2, borderRadius: 2 }}>
                  <Typography sx={{ color: "#9E9E9E", fontSize: 12, mb: 1 }}>Yearly Fee</Typography>
                  <Chip 
                    label={restaurant.yearlyFeeStatus === "paid" ? "Paid" : "Pending"}
                    size="small"
                    sx={{
                      bgcolor: restaurant.yearlyFeeStatus === "paid" ? "#00C95133" : "#FF980033",
                      color: restaurant.yearlyFeeStatus === "paid" ? "#00C951" : "#FF9800",
                      fontWeight: 600,
                      border: `1px solid ${restaurant.yearlyFeeStatus === "paid" ? "#00C951" : "#FF9800"}`,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Owner Section */}
          <Paper sx={{ p: 3, bgcolor: "#1E1E1E" }}>
            <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
              Owner Information
            </Typography>
            <Divider sx={{ mb: 2, borderColor: "#333" }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Owner Name */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <FiUser size={20} style={{ color: "#9E9E9E", marginTop: 2 }} />
                <Box>
                  <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>Name</Typography>
                  <Typography sx={{ color: "#fff" }}>{owner.name || "-"}</Typography>
                </Box>
              </Box>

              {/* Owner Email */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <FiMail size={20} style={{ color: "#9E9E9E", marginTop: 2 }} />
                <Box>
                  <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>Email</Typography>
                  <Typography sx={{ color: "#fff" }}>{owner.email || "-"}</Typography>
                </Box>
              </Box>

              {/* Edit Button */}
              <Button 
                variant="contained"
                startIcon={<FiEdit2 />}
                fullWidth
                onClick={() => router.push(`/admin/super/restaurants/edit/${id}`)}
                sx={{ 
                  mt: 1,
                  bgcolor: "#FF9800", 
                  color: "#000",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#F57C00" }
                }}
              >
                Edit Restaurant & Owner
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}