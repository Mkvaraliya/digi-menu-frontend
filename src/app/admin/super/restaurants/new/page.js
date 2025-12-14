"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  Switch,
  FormControlLabel,
  InputLabel,
} from "@mui/material";
import { FiChevronLeft, FiEye, FiEyeOff } from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";
import { apiAuthPost } from "@/lib/apiClient";

export default function AddRestaurantPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [planBuyDate, setPlanBuyDate] = useState(() => {
    const t = new Date();
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth() + 1).padStart(2, "0");
    const dd = String(t.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [setupFeeStatus, setSetupFeeStatus] = useState("pending");
  const [active, setActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  useEffect(() => {
    if (!slugManuallyEdited) {
      const derived = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\- ]/g, "")
        .replace(/\s+/g, "-")
        .replace(/\-+/g, "-");
      setSlug(derived);
    }
  }, [name, slugManuallyEdited]);

  const handleSlugChange = (v) => {
    setSlugManuallyEdited(true);
    setSlug(v);
  };

  const validate = () => {
    if (!name.trim()) {
      toast.error("Restaurant name is required");
      return false;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return false;
    }
    if (!ownerEmail.trim()) {
      toast.error("Owner email is required");
      return false;
    }
    if (!ownerPassword.trim()) {
      toast.error("Owner password is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerEmail)) {
      toast.error("Owner email appears invalid");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        ownerName: ownerName.trim() || undefined,
        ownerEmail: ownerEmail.trim().toLowerCase(),
        ownerPassword: ownerPassword,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        planBuyDate: planBuyDate ? new Date(planBuyDate).toISOString() : undefined,
        setupFeeStatus,
        active,
      };

      const res = await apiAuthPost("/api/super-admin/create-restaurant", payload);

      if (!res) throw new Error("Empty response from server");
      if (res.success === false) throw new Error(res.message || "Failed to create");

      toast.success("Restaurant created successfully");
      router.back();
    } catch (err) {
      console.error("create restaurant error:", err);
      toast.error(err.message || "Failed to create restaurant");
    } finally {
      setSubmitting(false);
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
    "& .MuiFormHelperText-root": { color: "#9E9E9E" }
  };

  return (
    <Box sx={{ bgcolor: "#121212", minHeight: "70vh", p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, color: "#fff" }}>Add Restaurant</h1>
          <p style={{ margin: 0, color: "#9E9E9E", fontSize: 13 }}>Create restaurant and owner credentials</p>
        </div>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Link href="/admin/super/restaurants">
            <Button 
              variant="outlined" 
              startIcon={<FiChevronLeft />} 
              sx={{ 
                color: "#fff", 
                borderColor: "#333",
                "&:hover": {
                  borderColor: "#555",
                  bgcolor: "#1E1E1E",
                }
              }}
            >
              Back to list
            </Button>
          </Link>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Restaurant Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputLabelProps={{ 
              style: { color: "#9E9E9E" },
              shrink: true
            }}
            sx={textFieldStyles}
            required
          />

          <TextField
            label="Slug *"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            helperText="URL-friendly identifier"
            InputLabelProps={{ 
              style: { color: "#9E9E9E" },
              shrink: true
            }}
            sx={textFieldStyles}
            required
          />

          <TextField
            label="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            InputLabelProps={{ 
              style: { color: "#9E9E9E" },
              shrink: true
            }}
            sx={textFieldStyles}
          />

          <TextField
            label="Owner Email *"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            type="email"
            InputLabelProps={{ 
              style: { color: "#9E9E9E" },
              shrink: true
            }}
            sx={textFieldStyles}
            required
          />

          <TextField
            label="Owner Password *"
            value={ownerPassword}
            onChange={(e) => setOwnerPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            InputLabelProps={{ 
              style: { color: "#9E9E9E" },
              shrink: true
            }}
            sx={textFieldStyles}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" sx={{ color: "#9E9E9E" }}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            InputLabelProps={{ 
              style: { color: "#9E9E9E" },
              shrink: true
            }}
            sx={textFieldStyles}
          />

          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            InputLabelProps={{ 
              style: { color: "#9E9E9E" },
              shrink: true
            }}
            sx={textFieldStyles}
          />

          <TextField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            multiline
            minRows={2}
            InputLabelProps={{ 
              style: { color: "#9E9E9E" },
              shrink: true
            }}
            sx={{ 
              gridColumn: "1 / span 2", 
              ...textFieldStyles
            }}
          />

          <TextField
            label="Plan Buy Date"
            type="date"
            value={planBuyDate}
            onChange={(e) => setPlanBuyDate(e.target.value)}
            InputLabelProps={{ 
              shrink: true, 
              style: { color: "#9E9E9E" }
            }}
            sx={{ 
              ...textFieldStyles,
              "& input[type='date']::-webkit-calendar-picker-indicator": {
                filter: "invert(1)",
                cursor: "pointer",
              }
            }}
          />

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel 
              shrink
              sx={{ 
                color: "#9E9E9E",
                "&.Mui-focused": { color: "#FF9800" }
              }}
            >
              Setup Fee Status
            </InputLabel>
            <Select
              value={setupFeeStatus}
              onChange={(e) => setSetupFeeStatus(e.target.value)}
              label="Setup Fee Status"
              notched
              sx={{ 
                bgcolor: "#1E1E1E", 
                color: "#fff",
                "& fieldset": { borderColor: "#333" },
                "&:hover fieldset": { borderColor: "#555" },
                "&.Mui-focused fieldset": { borderColor: "#FF9800" },
                "& .MuiSvgIcon-root": { color: "#fff" }
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={active} 
                  onChange={() => setActive((s) => !s)} 
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#FF9800",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#FF9800",
                    },
                  }}
                />
              }
              label={active ? "Active (public menu visible)" : "Inactive (public menu hidden)"}
              sx={{ "& .MuiFormControlLabel-label": { color: "#fff" } }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
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
              }
            }}
          >
            {submitting ? "Creating..." : "CREATE RESTAURANT"}
          </Button>

          <Button 
            variant="outlined" 
            onClick={() => router.push("/admin/super/restaurants")} 
            sx={{ 
              color: "#fff", 
              borderColor: "#333",
              "&:hover": {
                borderColor: "#555",
                bgcolor: "#1E1E1E",
              }
            }}
          >
            CANCEL
          </Button>
        </Box>
      </form>
    </Box>
  );
}