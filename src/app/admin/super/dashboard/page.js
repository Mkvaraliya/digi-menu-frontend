"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  FiList,
  FiPlus,
  FiBell,
  FiUsers,
  FiClipboard,
  FiSearch,
  FiChevronRight,
} from "react-icons/fi";
import { apiAuthGet } from "@/lib/apiClient";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [reminders, setReminders] = useState([]);
  const [recent, setRecent] = useState([]); // top newest restaurants
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchReminders(), fetchRecent()]);
    } catch (e) {
      console.error("dashboard fetch error", e);
      setError(e.message || "Failed to load dashboard");
      toast.error(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      // get restaurants list but only need pagination.total; send limit=1 to minimize load
      const res = await apiAuthGet("/api/super-admin/restaurants?page=1&limit=1");
      if (!res || res.success === false) throw new Error(res?.message || "Failed to fetch stats");
      setTotalRestaurants(res.pagination?.total || 0);
    } catch (e) {
      console.error("fetchStats", e);
      toast.error("Failed to fetch stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const res = await apiAuthGet("/api/super-admin/reminders?days=7");
      if (!res || res.success === false) throw new Error(res?.message || "Failed to fetch reminders");
      setReminders(res.data || []);
    } catch (e) {
      console.error("fetchReminders", e);
    }
  };

  const fetchRecent = async () => {
    try {
      // get first page with a few items
      const res = await apiAuthGet("/api/super-admin/restaurants?page=1&limit=5");
      if (!res || res.success === false) throw new Error(res?.message || "Failed to fetch recent");
      setRecent(res.data || []);
    } catch (e) {
      console.error("fetchRecent", e);
    }
  };

  const go = (path) => router.push(path);

  return (
    <Box sx={{ p: 3, bgcolor: "#0f0f0f", minHeight: "75vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
            Super Admin Dashboard
          </Typography>
          <Typography sx={{ color: "#9E9E9E", mt: 0.5 }}>
            Quick overview & alerts
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startIcon={<FiPlus />}
            onClick={() => go("/admin/super/restaurants/new")}
            sx={{
              bgcolor: "#FF9800",
              color: "#000",
              fontWeight: 700,
              "&:hover": { bgcolor: "#F57C00" },
            }}
          >
            Add Restaurant
          </Button>

          <Button variant="outlined" onClick={fetchAll} sx={{ color: "#fff", borderColor: "#333" }}>
            Refresh
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Paper sx={{ p: 6, textAlign: "center", bgcolor: "#121212" }}>
          <CircularProgress sx={{ color: "#FF9800" }} />
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {/* Left column: stats + quick nav */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: "#151515" }}>
                <Typography sx={{ color: "#9E9E9E", fontSize: 13 }}>Total Restaurants</Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                  <Box>
                    <Typography sx={{ color: "#fff", fontSize: 28, fontWeight: 700 }}>
                      {statsLoading ? <CircularProgress size={20} sx={{ color: "#FF9800" }} /> : totalRestaurants}
                    </Typography>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>Active / Inactive management available</Typography>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <IconButton
                      onClick={() => go("/admin/super/restaurants")}
                      sx={{ bgcolor: "#FF980020", color: "#FF9800", "&:hover": { bgcolor: "#FF980030" } }}
                    >
                      <FiList />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: "#151515" }}>
                <Typography sx={{ color: "#9E9E9E", fontSize: 13 }}>Quick Actions</Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                  <Button
                    startIcon={<FiList />}
                    onClick={() => go("/admin/super/restaurants")}
                    sx={{
                      justifyContent: "flex-start",
                      color: "#fff",
                      bgcolor: "transparent",
                      textTransform: "none",
                    }}
                  >
                    View all restaurants
                    <FiChevronRight style={{ marginLeft: "auto" }} />
                  </Button>

                  <Button
                    startIcon={<FiPlus />}
                    onClick={() => go("/admin/super/restaurants/new")}
                    sx={{
                      justifyContent: "flex-start",
                      color: "#fff",
                      bgcolor: "transparent",
                      textTransform: "none",
                    }}
                  >
                    Create restaurant
                    <FiChevronRight style={{ marginLeft: "auto" }} />
                  </Button>

                  <Button
                    startIcon={<FiBell />}
                    onClick={() => go("/admin/super/reminders")}
                    sx={{
                      justifyContent: "flex-start",
                      color: "#fff",
                      bgcolor: "transparent",
                      textTransform: "none",
                    }}
                  >
                    View reminders ({reminders.length})
                    <FiChevronRight style={{ marginLeft: "auto" }} />
                  </Button>

                  <Button
                    startIcon={<FiSearch />}
                    onClick={() => go("/admin/super/restaurants")}
                    sx={{
                      justifyContent: "flex-start",
                      color: "#fff",
                      bgcolor: "transparent",
                      textTransform: "none",
                    }}
                  >
                    Search restaurants
                    <FiChevronRight style={{ marginLeft: "auto" }} />
                  </Button>
                </Box>
              </Paper>

              <Paper sx={{ p: 2, bgcolor: "#151515" }}>
                <Typography sx={{ color: "#9E9E9E", fontSize: 13 }}>Recent restaurants</Typography>
                <List dense>
                  {recent.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No restaurants yet" primaryTypographyProps={{ color: "#9E9E9E" }} />
                    </ListItem>
                  )}
                  {recent.map((r) => (
                    <ListItem key={r._id} sx={{ "&:hover": { bgcolor: "#1b1b1b" } }}>
                      <ListItemText
                        primary={r.name}
                        secondary={r.city ? `${r.city} • ${r.phone || "-"}` : r.phone || "-"}
                        primaryTypographyProps={{ color: "#fff", fontWeight: 600 }}
                        secondaryTypographyProps={{ color: "#9E9E9E" }}
                        onClick={() => go(`/admin/super/restaurants/${r._id}`)}
                        sx={{ cursor: "pointer" }}
                      />
                      <IconButton onClick={() => go(`/admin/super/restaurants/${r._id}`)} sx={{ color: "#FF9800" }}>
                        <FiChevronRight />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          </Grid>

          {/* Right column: alerts + widgets */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: "#151515" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ color: "#fff", fontWeight: 700 }}>Alerts</Typography>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 13 }}>Plans expiring soon & unpaid</Typography>
                  </Box>

                  <Button
                    size="small"
                    onClick={() => go("/admin/super/reminders")}
                    sx={{
                      color: "#fff",
                      borderColor: "#333",
                      textTransform: "none",
                    }}
                    variant="outlined"
                  >
                    View all reminders
                  </Button>
                </Box>

                <Divider sx={{ bgcolor: "#222", my: 1 }} />

                {reminders.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography sx={{ color: "#9E9E9E" }}>No alerts for the next 7 days.</Typography>
                  </Box>
                ) : (
                  <List>
                    {reminders.map((r) => {
                      const days = r.daysUntilNextYearly;
                      const label = days > 0 ? `${days} day(s)` : days === 0 ? "due today" : `${Math.abs(days)} day(s) overdue`;
                      return (
                        <ListItem key={r._id} sx={{ "&:hover": { bgcolor: "#1b1b1b" } }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: "#fff", fontWeight: 600 }}>{r.name}</Typography>
                            <Typography sx={{ color: "#9E9E9E", fontSize: 13 }}>
                              Owner: {r.ownerId?.name || "-"} • {r.ownerId?.email || r.email || "-"}
                            </Typography>
                            <Typography sx={{ color: "#9E9E9E", fontSize: 12 }}>
                              Next due: {r.nextYearlyDueDate ? new Date(r.nextYearlyDueDate).toLocaleDateString() : "-"}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                              label={r.yearlyFeeStatus === "paid" ? "Yearly Paid" : "Yearly Pending"}
                              size="small"
                              sx={{
                                bgcolor: r.yearlyFeeStatus === "paid" ? "#00C95122" : "#FF980022",
                                color: r.yearlyFeeStatus === "paid" ? "#00C951" : "#FF9800",
                                border: `1px solid ${r.yearlyFeeStatus === "paid" ? "#00C951" : "#FF9800"}`,
                                fontWeight: 700,
                              }}
                            />
                            <Chip
                              label={label}
                              size="small"
                              sx={{
                                bgcolor: days <= 0 ? "#FF980022" : "#FF980020",
                                color: "#FF9800",
                                fontWeight: 700,
                              }}
                            />
                            <IconButton onClick={() => go(`/admin/super/restaurants/${r._id}`)} sx={{ color: "#FF9800" }}>
                              <FiChevronRight />
                            </IconButton>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Paper>

              {/* Extra widgets area - placeholder for future */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: "#151515" }}>
                    <Typography sx={{ color: "#fff", fontWeight: 700 }}>Quick report</Typography>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 13, mt: 1 }}>
                      Restaurants: <strong style={{ color: "#fff" }}>{totalRestaurants}</strong>
                    </Typography>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 13 }}>
                      Alerts (7d): <strong style={{ color: "#fff" }}>{reminders.length}</strong>
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button onClick={() => go("/admin/super/restaurants")} sx={{ bgcolor: "#FF9800", color: "#000" }}>
                        Manage restaurants
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: "#151515" }}>
                    <Typography sx={{ color: "#fff", fontWeight: 700 }}>Support / Notes</Typography>
                    <Typography sx={{ color: "#9E9E9E", fontSize: 13, mt: 1 }}>
                      Use quick actions to create restaurants, view reminders and manage owners.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
