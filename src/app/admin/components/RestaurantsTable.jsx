"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Pagination,
  Box,
  Switch,
  Tooltip,
} from "@mui/material";
import { FiEdit2, FiSearch, FiPlus, FiEye } from "react-icons/fi";
import { apiAuthGet, apiAuthPut } from "@/lib/apiClient"; // keep as your client provides
import { toast } from "sonner";

export default function RestaurantsTable() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // fetch function
  const fetchRestaurants = async ({ page = 1, limit = 10, search = "" } = {}) => {
    try {
      setLoading(true);
      const res = await apiAuthGet(
        `/api/super-admin/restaurants?search=${encodeURIComponent(
          search
        )}&page=${page}&limit=${limit}`
      );

      if (!res || !res.data) {
        setRestaurants([]);
        setTotalPages(1);
        setTotalItems(0);
        return;
      }

      setRestaurants(res.data || []);
      const pag = res.pagination || {};
      setPage(pag.page || page);
      setLimit(pag.limit || limit);
      setTotalPages(pag.pages || 1);
      setTotalItems(pag.total || (res.data || []).length);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  // initial & page/limit change
  useEffect(() => {
    fetchRestaurants({ page, limit, search: searchQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // search handler (resets to page 1)
  const onSearchChange = (value) => {
    setSearchQuery(value);
    setPage(1);
    fetchRestaurants({ page: 1, limit, search: value });
  };

  // toggle payment status (PATCH endpoint is /restaurant/:id/payment)
  const togglePaymentStatus = async (id, field, currentValue) => {
    // flip between "paid" and "pending" (matches sample)
    const newValue = currentValue === "paid" ? "pending" : "paid";

    setTogglingId(id);
    // optimistic update
    setRestaurants((prev) =>
      prev.map((r) => (r._id === id ? { ...r, [field]: newValue } : r))
    );

    try {
      const payload =
        field === "setupFeeStatus"
          ? { setupFeeStatus: newValue }
          : { yearlyFeeStatus: newValue };

      // your controller uses router.patch; we call PUT helper — replace with patch if you have it
      const res = await apiAuthPut(`/api/super-admin/restaurant/${id}/payment`, payload);

      if (!res || res.success === false) {
        throw new Error(res?.message || "Failed to update payment");
      }

      toast.success(
        `${field === "setupFeeStatus" ? "Setup fee" : "Yearly fee"} set to ${
          newValue === "paid" ? "Paid" : "Pending"
        }`
      );

      // if server returns updated restaurant object in res.data, update it
      if (res.data) {
        setRestaurants((prev) => prev.map((r) => (r._id === id ? res.data : r)));
      }
    } catch (err) {
      console.error("Failed to toggle payment status:", err);
      toast.error(err.message || "Failed to update payment status");
      // revert optimistic
      setRestaurants((prev) =>
        prev.map((r) => (r._id === id ? { ...r, [field]: currentValue } : r))
      );
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const handlePageChange = (e, newPage) => {
    setPage(newPage);
    fetchRestaurants({ page: newPage, limit, search: searchQuery });
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "#121212",
          minHeight: "60vh",
          px: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <h1 className="text-2xl" style={{ color: "#fff", margin: 0 }}>
            Restaurants
          </h1>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              placeholder="Search Restaurants..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  bgcolor: "#1E1E1E",
                  borderRadius: "8px",
                  height: "45px",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#555" },
                  "&.Mui-focused fieldset": { borderColor: "#FF9800" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch color="#9E9E9E" size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <Link href="/admin/restaurants/new">
              <Button
                variant="contained"
                startIcon={<FiPlus />}
                sx={{
                  bgcolor: "#FF9800",
                  color: "#000",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  "&:hover": { bgcolor: "#F57C00" },
                }}
              >
                Add Restaurant
              </Button>
            </Link>
          </Box>
        </Box>

        {/* TABLE */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <TableContainer
            component={Paper}
            sx={{
              bgcolor: "#1E1E1E",
              border: "1px solid #2A2A2A",
              borderRadius: "12px",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    // "Address",
                    "Owner",
                    "Start Date",
                    "Next Due",
                    "Setup Fee",
                    "Yearly Fee",
                    "Actions",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        bgcolor: "#FF9800",
                        color: "black",
                        border: "none",
                        fontWeight: 600,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {restaurants.map((r) => {
                  const id = r._id;
                  const ownerName = r.ownerId?.name || "-";
                  const ownerEmail = r.ownerId?.email || "-";
                  const setupPaid = r.setupFeeStatus === "paid";
                  const yearlyPaid = r.yearlyFeeStatus === "paid";
                  const isToggling = togglingId === id;

                  return (
                    <TableRow key={id} sx={{ "&:hover": { bgcolor: "#252525" } }}>
                      <TableCell sx={{ color: "#fff" }}>{r.name}</TableCell>

                      <TableCell sx={{ color: "#fff" }}>{r.email || "-"}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{r.phone || "-"}</TableCell>
                      {/* <TableCell sx={{ color: "#fff" }}>{r.address || "-"}</TableCell> */}

                      <TableCell sx={{ color: "#fff" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span>{ownerName}</span>
                          <span style={{ color: "#9E9E9E", fontSize: 12 }}>{ownerEmail}</span>
                        </div>
                      </TableCell>

                      <TableCell sx={{ color: "#fff" }}>{formatDate(r.startDate)}</TableCell>

                      <TableCell sx={{ color: "#fff" }}>
                        {formatDate(r.nextYearlyDueDate)}
                      </TableCell>

                      <TableCell sx={{ color: "#fff", minWidth: 140 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Switch
                            size="small"
                            checked={setupPaid}
                            disabled={isToggling || loading}
                            onChange={() =>
                              togglePaymentStatus(id, "setupFeeStatus", r.setupFeeStatus)
                            }
                          />
                          <span style={{ color: setupPaid ? "#00C951" : "red", fontWeight: 500 }}>
                            {setupPaid ? "Paid" : (r.setupFeeStatus || "pending")}
                          </span>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: "#fff", minWidth: 140 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Switch
                            size="small"
                            checked={yearlyPaid}
                            disabled={isToggling || loading}
                            onChange={() =>
                              togglePaymentStatus(id, "yearlyFeeStatus", r.yearlyFeeStatus)
                            }
                          />
                          <span style={{ color: yearlyPaid ? "#00C951" : "red", fontWeight: 500 }}>
                            {yearlyPaid ? "Paid" : (r.yearlyFeeStatus || "pending")}
                          </span>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton
                              onClick={() => router.push(`/admin/restaurants/${id}`)}
                              sx={{ fontSize: "17px", color: "#00C951" }}
                            >
                              <FiEye />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => router.push(`/admin/restaurants/edit/${id}`)}
                              sx={{ fontSize: "17px", color: "#FF9800" }}
                            >
                              <FiEdit2 />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {restaurants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ color: "#9E9E9E", textAlign: "center", py: 4 }}>
                      {loading ? "Loading restaurants..." : "No restaurants found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* PAGINATION */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
          <Box sx={{ color: "#9E9E9E" }}>
            Showing page {page} of {totalPages} • {totalItems} restaurants
          </Box>

          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#9E9E9E",
                "&.Mui-selected": { bgcolor: "#FF9800", color: "black" },
              },
            }}
          />
        </Box>
      </Box>
    </>
  );
}
