"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  InputLabel,
  Grid,
} from "@mui/material";
import { FiChevronLeft, FiEye, FiEyeOff, FiSave, FiX, FiKey } from "react-icons/fi";
import { apiAuthGet, apiAuthPut, apiAuthPost, apiAuthPatch } from "@/lib/apiClient";
import { toast } from "sonner";

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // owner password modal
  const [pwOpen, setPwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!restaurant) return;
    try {
      setSaving(true);
      const payload = {
        name: restaurant.name,
        slug: restaurant.slug,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        city: restaurant.city,
        planBuyDate: restaurant.planBuyDate,
        active: restaurant.active,
        setupFeeStatus: restaurant.setupFeeStatus,
        yearlyFeeStatus: restaurant.yearlyFeeStatus,
      };

      const res = await apiAuthPut(`/api/super-admin/restaurant/${id}`, payload);
      if (!res || res.success === false) throw new Error(res?.message || "Failed to update");
      setRestaurant(res.data || restaurant);
      toast.success("Updated restaurant");
      router.push(`/admin/super/restaurants/${id}`);
    } catch (err) {
      console.error("save error:", err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeOwnerPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setPwBusy(true);
      const ownerId = restaurant.ownerId?._id;
      if (!ownerId) throw new Error("Owner not found");

      const res = await apiAuthPatch(`/api/super-admin/owner/${ownerId}/password`, { newPassword });
      if (!res || res.success === false) throw new Error(res?.message || "Failed to change password");

      toast.success("Owner password changed");
      setPwOpen(false);
      setNewPassword("");
    } catch (err) {
      console.error("change password error:", err);
      toast.error(err.message || "Failed to change password");
    } finally {
      setPwBusy(false);
    }
  };

  // Common text field styles
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#1E1E1E",
      color: "#fff",
      "& fieldset": { borderColor: "#333" },
      "&:hover fieldset": { borderColor: "#555" },
      "&.Mui-focused fieldset": { borderColor: "#FF9800" },
    },
    "& .MuiFormHelperText-root": { color: "#9E9E9E" },
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
        <Typography sx={{ color: "#f44336", mb: 2 }}>Restaurant not found</Typography>
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

  return (
    <Box sx={{ bgcolor: "#121212", minHeight: "70vh", p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 600, mb: 0.5 }}>
            Edit Restaurant
          </Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: 14 }}>
            Modify restaurant & owner settings
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Link href={`/admin/super/restaurants/${id}`}>
            <Button
              variant="outlined"
              startIcon={<FiChevronLeft />}
              sx={{
                color: "#fff",
                borderColor: "#333",
                "&:hover": {
                  borderColor: "#555",
                  bgcolor: "#1E1E1E",
                },
              }}
            >
              Back to View
            </Button>
          </Link>

          <Button
            variant="contained"
            startIcon={<FiKey />}
            onClick={() => setPwOpen(true)}
            sx={{
              bgcolor: "#9C27B0",
              color: "#fff",
              "&:hover": { bgcolor: "#7B1FA2" },
            }}
          >
            Change Owner Password
          </Button>
        </Box>
      </Box>

      <form onSubmit={handleSave}>
        <Grid container spacing={3}>
          {/* Restaurant Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: "#1E1E1E" }}>
              <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                Restaurant Information
              </Typography>
              <Divider sx={{ mb: 3, borderColor: "#333" }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Restaurant Name"
                    value={restaurant.name || ""}
                    onChange={(e) => setRestaurant((p) => ({ ...p, name: e.target.value }))}
                    InputLabelProps={{ style: { color: "#9E9E9E" }, shrink: true }}
                    sx={textFieldStyles}
                    fullWidth
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Slug"
                    value={restaurant.slug || ""}
                    onChange={(e) => setRestaurant((p) => ({ ...p, slug: e.target.value }))}
                    InputLabelProps={{ style: { color: "#9E9E9E" }, shrink: true }}
                    sx={textFieldStyles}
                    fullWidth
                    required
                    helperText="URL-friendly identifier"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    value={restaurant.email || ""}
                    onChange={(e) => setRestaurant((p) => ({ ...p, email: e.target.value }))}
                    InputLabelProps={{ style: { color: "#9E9E9E" }, shrink: true }}
                    sx={textFieldStyles}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone"
                    value={restaurant.phone || ""}
                    onChange={(e) => setRestaurant((p) => ({ ...p, phone: e.target.value }))}
                    InputLabelProps={{ style: { color: "#9E9E9E" }, shrink: true }}
                    sx={textFieldStyles}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="City"
                    value={restaurant.city || ""}
                    onChange={(e) => setRestaurant((p) => ({ ...p, city: e.target.value }))}
                    InputLabelProps={{ style: { color: "#9E9E9E" }, shrink: true }}
                    sx={textFieldStyles}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Address"
                    value={restaurant.address || ""}
                    onChange={(e) => setRestaurant((p) => ({ ...p, address: e.target.value }))}
                    InputLabelProps={{ style: { color: "#9E9E9E" }, shrink: true }}
                    sx={textFieldStyles}
                    fullWidth
                    multiline
                    rows={1}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Billing Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: "#1E1E1E", height: "100%" }}>
              <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                Billing Information
              </Typography>
              <Divider sx={{ mb: 3, borderColor: "#333" }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Plan Buy Date"
                  type="date"
                  value={restaurant.planBuyDate ? new Date(restaurant.planBuyDate).toISOString().slice(0, 10) : ""}
                  onChange={(e) => setRestaurant((p) => ({ ...p, planBuyDate: new Date(e.target.value).toISOString() }))}
                  InputLabelProps={{ shrink: true, style: { color: "#9E9E9E" } }}
                  sx={{
                    ...textFieldStyles,
                    "& input[type='date']::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)",
                      cursor: "pointer",
                    },
                  }}
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel
                    shrink
                    sx={{
                      color: "#9E9E9E",
                      "&.Mui-focused": { color: "#FF9800" },
                    }}
                  >
                    Setup Fee Status
                  </InputLabel>
                  <Select
                    value={restaurant.setupFeeStatus || "pending"}
                    onChange={(e) => setRestaurant((p) => ({ ...p, setupFeeStatus: e.target.value }))}
                    label="Setup Fee Status"
                    notched
                    sx={{
                      bgcolor: "#1E1E1E",
                      color: "#fff",
                      "& fieldset": { borderColor: "#333" },
                      "&:hover fieldset": { borderColor: "#555" },
                      "&.Mui-focused fieldset": { borderColor: "#FF9800" },
                      "& .MuiSvgIcon-root": { color: "#fff" },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "#1E1E1E",
                          color: "#fff",
                          "& .MuiMenuItem-root": {
                            color: "#fff",
                            "&:hover": {
                              bgcolor: "#2A2A2A",
                            },
                            "&.Mui-selected": {
                              bgcolor: "#FF9800",
                              color: "#000",
                              "&:hover": {
                                bgcolor: "#F57C00",
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel
                    shrink
                    sx={{
                      color: "#9E9E9E",
                      "&.Mui-focused": { color: "#FF9800" },
                    }}
                  >
                    Yearly Fee Status
                  </InputLabel>
                  <Select
                    value={restaurant.yearlyFeeStatus || "pending"}
                    onChange={(e) => setRestaurant((p) => ({ ...p, yearlyFeeStatus: e.target.value }))}
                    label="Yearly Fee Status"
                    notched
                    sx={{
                      bgcolor: "#1E1E1E",
                      color: "#fff",
                      "& fieldset": { borderColor: "#333" },
                      "&:hover fieldset": { borderColor: "#555" },
                      "&.Mui-focused fieldset": { borderColor: "#FF9800" },
                      "& .MuiSvgIcon-root": { color: "#fff" },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "#1E1E1E",
                          color: "#fff",
                          "& .MuiMenuItem-root": {
                            color: "#fff",
                            "&:hover": {
                              bgcolor: "#2A2A2A",
                            },
                            "&.Mui-selected": {
                              bgcolor: "#FF9800",
                              color: "#000",
                              "&:hover": {
                                bgcolor: "#F57C00",
                              },
                            },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Grid>

          {/* Status Settings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: "#1E1E1E", height: "100%" }}>
              <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontWeight: 600 }}>
                Status Settings
              </Typography>
              <Divider sx={{ mb: 3, borderColor: "#333" }} />

              <Box
                sx={{
                  bgcolor: "#252525",
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #333",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!restaurant.active}
                      onChange={(e) => setRestaurant((p) => ({ ...p, active: e.target.checked }))}
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
                    <Box>
                      <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                        {restaurant.active ? "Active" : "Inactive"}
                      </Typography>
                      <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>
                        {restaurant.active
                          ? "Public menu is visible and accessible"
                          : "Public menu is hidden from customers"}
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {restaurant.ownerId && (
                <Box sx={{ mt: 3, p: 2, bgcolor: "#252525", borderRadius: 2 }}>
                  <Typography sx={{ color: "#9E9E9E", fontSize: 12, mb: 1 }}>Owner Details</Typography>
                  <Typography sx={{ color: "#fff", mb: 0.5 }}>
                    <strong>Name:</strong> {restaurant.ownerId.name || "-"}
                  </Typography>
                  <Typography sx={{ color: "#fff" }}>
                    <strong>Email:</strong> {restaurant.ownerId.email || "-"}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-start" }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<FiSave />}
            disabled={saving}
            sx={{
              bgcolor: "#FF9800",
              color: "#000",
              px: 4,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#F57C00",
              },
              "&:disabled": {
                bgcolor: "#555",
                color: "#999",
              },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<FiX />}
            onClick={() => router.push(`/admin/super/restaurants/${id}`)}
            sx={{
              color: "#fff",
              borderColor: "#333",
              "&:hover": {
                borderColor: "#555",
                bgcolor: "#1E1E1E",
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </form>

      {/* Change Owner Password Dialog */}
      <Dialog
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1E1E1E",
            color: "#fff",
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff", borderBottom: "1px solid #333" }}>
          Change Owner Password
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type={showPw ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputLabelProps={{
              style: { color: "#9E9E9E" },
              shrink: true,
            }}
            sx={textFieldStyles}
            helperText="Minimum 6 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPw((s) => !s)} edge="end" sx={{ color: "#9E9E9E" }}>
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #333" }}>
          <Button
            onClick={() => setPwOpen(false)}
            sx={{
              color: "#fff",
              "&:hover": { bgcolor: "#2A2A2A" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangeOwnerPassword}
            disabled={pwBusy}
            variant="contained"
            sx={{
              bgcolor: "#9C27B0",
              color: "#fff",
              "&:hover": { bgcolor: "#7B1FA2" },
              "&:disabled": {
                bgcolor: "#555",
                color: "#999",
              },
            }}
          >
            {pwBusy ? "Changing..." : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}