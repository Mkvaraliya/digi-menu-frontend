"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Box,
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
    Switch,
    Tooltip,
    MenuItem,
    Select,
    FormControl,
    CircularProgress,
    Chip,
    Typography,
} from "@mui/material";
import { FiEdit2, FiSearch, FiPlus, FiEye, FiLogIn } from "react-icons/fi";
import { toast } from "sonner";
import { apiAuthGet, apiAuthPut, apiAuthPost, apiAuthPatch } from "@/lib/apiClient";

export default function RestaurantsPage() {
    const router = useRouter();

    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");

    const [togglingId, setTogglingId] = useState(null);
    const [impersonatingId, setImpersonatingId] = useState(null);

    useEffect(() => {
        fetchRestaurants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filter]);

    const fetchRestaurants = async (params = {}) => {
        try {
            setLoading(true);
            const q = {
                page: params.page ?? page,
                limit,
                search: params.search ?? search,
                filter: params.filter ?? filter,
            };
            const qs = new URLSearchParams();
            if (q.search) qs.append("search", q.search);
            qs.append("page", q.page);
            qs.append("limit", q.limit);
            if (q.filter) qs.append("filter", q.filter);

            const res = await apiAuthGet(`/api/super-admin/restaurants?${qs.toString()}`);
            if (!res) throw new Error("Empty response");
            if (res.success === false) throw new Error(res.message || "Failed to fetch");

            setRestaurants(res.data || []);
            setPage(res.pagination?.page || q.page);
            setTotalPages(res.pagination?.pages || 1);
            setTotalItems(res.pagination?.total || (res.data || []).length);
        } catch (err) {
            console.error("fetchRestaurants error:", err);
            toast.error(err.message || "Failed to load restaurants");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
        fetchRestaurants({ page: 1, search: val, filter });
    };

    const handlePageChange = (e, newPage) => {
        setPage(newPage);
    };

    const togglePayment = async (id, field, currentValue) => {
        const newValue = currentValue === "paid" ? "pending" : "paid";

        if (newValue === "pending") {
            const ok = window.confirm("Marking this fee as pending (unpaid). Are you sure?");
            if (!ok) return;
        }

        try {
            setTogglingId(id);
            setRestaurants((prev) => prev.map((r) => (r._id === id ? { ...r, [field]: newValue } : r)));

            const payload = field === "setupFeeStatus" ? { setupFeeStatus: newValue } : { yearlyFeeStatus: newValue };
            const res = await apiAuthPatch(`/api/super-admin/restaurant/${id}/payment`, payload);

            if (!res || res.success === false) {
                throw new Error(res?.message || "Failed to update payment status");
            }

            if (res.data) {
                setRestaurants((prev) => prev.map((r) => (r._id === id ? res.data : r)));
            }

            toast.success(`Updated ${field === "setupFeeStatus" ? "setup fee" : "yearly fee"}`);
        } catch (err) {
            console.error("togglePayment error:", err);
            toast.error(err.message || "Failed to update payment");
            fetchRestaurants();
        } finally {
            setTogglingId(null);
        }
    };

    const toggleActive = async (id, currentActive) => {
        const newActive = !currentActive;
        const confirmText = newActive
            ? "Make this restaurant ACTIVE? This will restore its public menu."
            : "Make this restaurant INACTIVE? Its public menu will be hidden.";
        const ok = window.confirm(confirmText);
        if (!ok) return;

        try {
            setTogglingId(id);
            setRestaurants((prev) => prev.map((r) => (r._id === id ? { ...r, active: newActive } : r)));

            const res = await apiAuthPatch(`/api/super-admin/restaurant/${id}`, { active: newActive });
            if (!res || res.success === false) throw new Error(res?.message || "Failed to update");

            if (res.data) setRestaurants((prev) => prev.map((r) => (r._id === id ? res.data : r)));

            toast.success(`Restaurant ${newActive ? "activated" : "deactivated"}`);
        } catch (err) {
            console.error("toggleActive error:", err);
            toast.error(err.message || "Failed to update active status");
            fetchRestaurants();
        } finally {
            setTogglingId(null);
        }
    };

    const handleImpersonate = async (restaurantId) => {
        try {
            if (!confirm("You are about to impersonate this owner. Continue?")) return;

            setImpersonatingId(restaurantId);
            const res = await apiAuthPost(`/api/super-admin/restaurant/${restaurantId}/impersonate`, {});

            if (!res || res.success === false) {
                throw new Error(res?.message || "Failed to impersonate");
            }

            const token = res.token || (res.data && res.data.token) || null;
            if (!token) throw new Error("No token received from impersonation endpoint");

            localStorage.setItem("token", token);
            localStorage.setItem("impersonation", "1");

            toast.success("Impersonation token received — redirecting to owner UI...");
            window.location.href = "/owner";
        } catch (err) {
            console.error("handleImpersonate error:", err);
            toast.error(err.message || "Impersonation failed");
        } finally {
            setImpersonatingId(null);
        }
    };

    const viewRestaurant = (id) => router.push(`/admin/super/restaurants/${id}`);
    const editRestaurant = (id) => router.push(`/admin/super/restaurants/edit/${id}`);

    return (
        <Box sx={{ bgcolor: "#121212", minHeight: "70vh", p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="h4" sx={{ color: "#fff", fontWeight: 600 }}>
                        Restaurants
                    </Typography>

                    <Link href="/admin/super/restaurants/new">
                        <Button
                            variant="contained"
                            startIcon={<FiPlus />}
                            sx={{
                                bgcolor: "#FF9800",
                                color: "#000",
                                fontWeight: 600,
                                textTransform: "none",
                                px: 3,
                                py: 1.2,
                                "&:hover": { bgcolor: "#F57C00" },
                            }}
                        >
                            Add Restaurant
                        </Button>
                    </Link>
                </Box>

                <Typography sx={{ color: "#9E9E9E", fontSize: 14, mb: 3 }}>
                    Manage all restaurants and their settings
                </Typography>

                {/* Search and Filter Bar */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        placeholder="Search by name, phone, email..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        sx={{
                            flex: 1,
                            maxWidth: 400,
                            "& .MuiOutlinedInput-root": {
                                color: "#fff",
                                bgcolor: "#1E1E1E",
                                borderRadius: "8px",
                                "& fieldset": { borderColor: "#333" },
                                "&:hover fieldset": { borderColor: "#555" },
                                "&.Mui-focused fieldset": { borderColor: "#FF9800" },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FiSearch color="#9E9E9E" size={18} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl sx={{ minWidth: 200 }}>
                        <Select
                            value={filter}
                            displayEmpty
                            onChange={(e) => {
                                setFilter(e.target.value);
                                setPage(1);
                                fetchRestaurants({ page: 1, search, filter: e.target.value });
                            }}
                            sx={{
                                color: "#fff",
                                bgcolor: "#1E1E1E",
                                borderRadius: "8px",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#333" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF9800" },
                                "& .MuiSvgIcon-root": { color: "#fff" },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: "#1E1E1E",
                                        color: "#fff",
                                        "& .MuiMenuItem-root": {
                                            color: "#fff",
                                            "&:hover": { bgcolor: "#2A2A2A" },
                                            "&.Mui-selected": {
                                                bgcolor: "#FF9800",
                                                color: "#000",
                                                "&:hover": { bgcolor: "#F57C00" },
                                            },
                                        },
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">All Restaurants</MenuItem>
                            <MenuItem value="planExpiringSoon">Plan expiring soon</MenuItem>
                            <MenuItem value="planExpired">Plan expired</MenuItem>
                            <MenuItem value="unpaidSetup">Unpaid setup fee</MenuItem>
                            <MenuItem value="unpaidYearly">Unpaid yearly fee</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    bgcolor: "#1E1E1E",
                    borderRadius: 2,
                    border: "1px solid #333",
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ bgcolor: "#252525", color: "#fff", fontWeight: 600, borderBottom: "2px solid #FF9800" }}>
                                Restaurant
                            </TableCell>
                            <TableCell sx={{ bgcolor: "#252525", color: "#fff", fontWeight: 600, borderBottom: "2px solid #FF9800" }}>
                                Contact
                            </TableCell>
                            <TableCell sx={{ bgcolor: "#252525", color: "#fff", fontWeight: 600, borderBottom: "2px solid #FF9800", textAlign: "center" }}>
                                Setup Fee
                            </TableCell>
                            <TableCell sx={{ bgcolor: "#252525", color: "#fff", fontWeight: 600, borderBottom: "2px solid #FF9800", textAlign: "center" }}>
                                Days Left
                            </TableCell>
                            <TableCell sx={{ bgcolor: "#252525", color: "#fff", fontWeight: 600, borderBottom: "2px solid #FF9800", textAlign: "center" }}>
                                Yearly Fee
                            </TableCell>
                            <TableCell sx={{ bgcolor: "#252525", color: "#fff", fontWeight: 600, borderBottom: "2px solid #FF9800", textAlign: "center" }}>
                                Status
                            </TableCell>
                            <TableCell sx={{ bgcolor: "#252525", color: "#fff", fontWeight: 600, borderBottom: "2px solid #FF9800", textAlign: "center" }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: "center", py: 8, borderBottom: "none" }}>
                                    <CircularProgress sx={{ color: "#FF9800" }} />
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && restaurants.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ color: "#9E9E9E", textAlign: "center", py: 8, borderBottom: "none" }}>
                                    No restaurants found.
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && restaurants.map((r) => {
                            const id = r._id;
                            const setupPaid = r.setupFeeStatus === "paid";
                            const yearlyPaid = r.yearlyFeeStatus === "paid";
                            const isBusy = togglingId === id || impersonatingId === id;

                            return (
                                <TableRow
                                    key={id}
                                    sx={{
                                        "&:hover": { bgcolor: "#252525" },
                                        transition: "background-color 0.2s",
                                    }}
                                >
                                    {/* Restaurant Info */}
                                    <TableCell sx={{ borderBottom: "1px solid #333" }}>
                                        <Box>
                                            <Typography sx={{ color: "#fff", fontWeight: 500, mb: 0.5 }}>
                                                {r.name}
                                            </Typography>
                                            <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>
                                                {r.city || "No city"}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Contact */}
                                    <TableCell sx={{ borderBottom: "1px solid #333" }}>
                                        <Box>
                                            <Typography sx={{ color: "#fff", fontSize: 14 }}>
                                                {r.phone || "-"}
                                            </Typography>
                                            {r.email && (
                                                <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>
                                                    {r.email}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>

                                    {/* Setup Fee */}
                                    <TableCell sx={{ borderBottom: "1px solid #333", textAlign: "center" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                            <Switch
                                                size="small"
                                                checked={setupPaid}
                                                disabled={isBusy}
                                                onChange={() => togglePayment(id, "setupFeeStatus", r.setupFeeStatus)}
                                                sx={{
                                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                                        color: "#00C951",
                                                    },
                                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                        backgroundColor: "#00C951",
                                                    },
                                                }}
                                            />
                                            <Chip
                                                label={setupPaid ? "Paid" : "Pending"}
                                                size="small"
                                                sx={{
                                                    bgcolor: setupPaid ? "#00C95133" : "#FF980033",
                                                    color: setupPaid ? "#00C951" : "#FF9800",
                                                    fontWeight: 600,
                                                    fontSize: 11,
                                                    border: `1px solid ${setupPaid ? "#00C951" : "#FF9800"}`,
                                                }}
                                            />
                                        </Box>
                                    </TableCell>

                                    <TableCell sx={{ borderBottom: "1px solid #333", textAlign: "center" }}>
                                        <Typography
                                            sx={{
                                                color: r.daysUntilNextYearly < 7 ? "red" : "#fff",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {r.daysUntilNextYearly}
                                        </Typography>
                                    </TableCell>


                                    {/* Yearly Fee */}
                                    <TableCell sx={{ borderBottom: "1px solid #333", textAlign: "center" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                            <Switch
                                                size="small"
                                                checked={yearlyPaid}
                                                disabled={isBusy}
                                                onChange={() => togglePayment(id, "yearlyFeeStatus", r.yearlyFeeStatus)}
                                                sx={{
                                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                                        color: "#00C951",
                                                    },
                                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                        backgroundColor: "#00C951",
                                                    },
                                                }}
                                            />
                                            <Chip
                                                label={yearlyPaid ? "Paid" : "Pending"}
                                                size="small"
                                                sx={{
                                                    bgcolor: yearlyPaid ? "#00C95133" : "#FF980033",
                                                    color: yearlyPaid ? "#00C951" : "#FF9800",
                                                    fontWeight: 600,
                                                    fontSize: 11,
                                                    border: `1px solid ${yearlyPaid ? "#00C951" : "#FF9800"}`,
                                                }}
                                            />
                                        </Box>
                                    </TableCell>

                                    {/* Active Status */}
                                    <TableCell sx={{ borderBottom: "1px solid #333", textAlign: "center" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                            <Switch
                                                checked={!!r.active}
                                                onChange={() => toggleActive(id, !!r.active)}
                                                disabled={isBusy}
                                                size="small"
                                                sx={{
                                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                                        color: "#00C951",
                                                    },
                                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                        backgroundColor: "#00C951",
                                                    },
                                                }}
                                            />
                                            <Typography sx={{ color: r.active ? "#00C951" : "#9E9E9E", fontSize: 12, fontWeight: 500 }}>
                                                {r.active ? "Active" : "Inactive"}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell sx={{ borderBottom: "1px solid #333" }}>
                                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    onClick={() => viewRestaurant(id)}
                                                    size="small"
                                                    sx={{
                                                        color: "#00C951",
                                                        bgcolor: "#00C95120",
                                                        "&:hover": { bgcolor: "#00C95130" }
                                                    }}
                                                >
                                                    <FiEye size={16} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Edit">
                                                <IconButton
                                                    onClick={() => editRestaurant(id)}
                                                    size="small"
                                                    sx={{
                                                        color: "#FF9800",
                                                        bgcolor: "#FF980020",
                                                        "&:hover": { bgcolor: "#FF980030" }
                                                    }}
                                                >
                                                    <FiEdit2 size={16} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Impersonate Owner">
                                                <span>
                                                    <IconButton
                                                        onClick={() => handleImpersonate(id)}
                                                        size="small"
                                                        disabled={isBusy}
                                                        sx={{
                                                            color: "#1976d2",
                                                            bgcolor: "#1976d220",
                                                            "&:hover": { bgcolor: "#1976d230" },
                                                            "&:disabled": { color: "#555", bgcolor: "transparent" }
                                                        }}
                                                    >
                                                        <FiLogIn size={16} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            {!loading && restaurants.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 14 }}>
                        Showing page {page} of {totalPages} • {totalItems} total restaurants
                    </Typography>

                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        sx={{
                            "& .MuiPaginationItem-root": {
                                color: "#9E9E9E",
                                borderColor: "#333",
                                "&:hover": {
                                    bgcolor: "#1E1E1E",
                                    borderColor: "#555",
                                },
                                "&.Mui-selected": {
                                    bgcolor: "#FF9800",
                                    color: "#000",
                                    fontWeight: 600,
                                    "&:hover": {
                                        bgcolor: "#F57C00",
                                    }
                                },
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}