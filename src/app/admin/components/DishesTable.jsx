"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  MenuItem,
  Select,
  FormControl,
  Switch,
} from "@mui/material";
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiEye } from "react-icons/fi";
import { apiAuthGet, apiAuthDelete, apiAuthPut } from "@/lib/apiClient";
import { toast } from "sonner";

export default function DishesTable() {
  const router = useRouter();

  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // category name
  const [selectedSubcategory, setSelectedSubcategory] = useState(""); // subcategory name

  const [page, setPage] = useState(1);
  const rowsPerPage = 7;

  const [deletingId, setDeletingId] = useState(null); // _id being deleted
  const [togglingId, setTogglingId] = useState(null); // _id whose status is being toggled

  // Fetch dishes once
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await apiAuthGet("/api/owner/dishes");
        setDishes(res.data || []);
      } catch (err) {
        console.error("Failed to fetch dishes:", err);
        toast.error("Failed to load dishes");
      }
    };

    fetchDishes();
  }, []);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiAuthGet("/api/owner/categories");
      setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Build category options from API + dishes
  const categoryOptions = useMemo(() => {
    const fromApi = categories.map((c) => c.name).filter(Boolean);
    const fromDishes = dishes.map((d) => d.categoryId?.name).filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromDishes]));
  }, [categories, dishes]);

  // Build subcategory options based on selected category
  const subcategoryOptions = useMemo(() => {
    let source = dishes;

    if (selectedCategory) {
      source = dishes.filter(
        (d) => d.categoryId?.name === selectedCategory
      );
    }

    const subs = source
      .map((d) => d.subcategoryId?.name)
      .filter(Boolean);

    return Array.from(new Set(subs));
  }, [dishes, selectedCategory]);

  // Reset subcategory whenever category changes
  useEffect(() => {
    setSelectedSubcategory("");
    setPage(1);
  }, [selectedCategory]);

  // Filter + paginate
  const filteredDishes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return dishes.filter((dish) => {
      if (q && !dish.name.toLowerCase().includes(q)) return false;

      if (selectedCategory && dish.categoryId?.name !== selectedCategory) {
        return false;
      }

      if (
        selectedSubcategory &&
        dish.subcategoryId?.name !== selectedSubcategory
      ) {
        return false;
      }

      return true;
    });
  }, [dishes, searchQuery, selectedCategory, selectedSubcategory]);

  const pageCount = Math.ceil(filteredDishes.length / rowsPerPage) || 1;

  const paginatedDishes = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDishes.slice(start, start + rowsPerPage);
  }, [filteredDishes, page]);

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  // ------- DELETE ----------

  const doDelete = async (id) => {
    try {
      setDeletingId(id);
      await apiAuthDelete(`/api/owner/dishes/${id}`);
      setDishes((prev) => prev.filter((d) => (d._id || d.id) !== id));
      toast.success("Dish deleted");
    } catch (err) {
      console.error("Failed to delete dish:", err);
      toast.error(err.message || "Failed to delete dish");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (id, name) => {
    toast.warning("Delete this dish?", {
      description: name
        ? `"${name}" will be permanently removed.`
        : "This action cannot be undone.",
      duration: 8000,
      action: {
        label: "Delete",
        onClick: () => doDelete(id),
      },
    });
  };

  // ------- STATUS TOGGLE ----------

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "available" ? "out_of_stock" : "available";

    // optimistic update
    setTogglingId(id);
    setDishes((prev) =>
      prev.map((d) =>
        (d._id || d.id) === id ? { ...d, status: newStatus } : d
      )
    );

    try {
      // if your backend expects full payload instead of partial,
      // adjust updateDish to support partial or send all fields here
      await apiAuthPut(`/api/owner/dishes/${id}`, { status: newStatus });
      toast.success(
        newStatus === "available"
          ? "Dish marked as available"
          : "Dish marked as out of stock"
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err.message || "Failed to update status");

      // revert UI on error
      setDishes((prev) =>
        prev.map((d) =>
          (d._id || d.id) === id ? { ...d, status: currentStatus } : d
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      {/* Full-screen overlay while deleting */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-[#ffb300] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#f5f5f5]">Deleting dish...</p>
          </div>
        </div>
      )}

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
            Menu Master
          </h1>

          <Box sx={{ display: "flex", gap: 2 }}>
            {/* Search */}
            <TextField
              placeholder="Search Dishes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              sx={{
                width: 260,
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

            {/* Category dropdown */}
            <FormControl
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#1E1E1E",
                  borderRadius: "8px",
                  height: "45px",
                  color: "#fff",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#555" },
                  "&.Mui-focused fieldset": { borderColor: "#FF9800" },
                },
                "& .MuiSvgIcon-root": { color: "#fff" },
              }}
            >
              <Select
                value={selectedCategory}
                displayEmpty
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {categoryOptions.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Subcategory dropdown */}
            <FormControl
              sx={{
                minWidth: 180,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#1E1E1E",
                  borderRadius: "8px",
                  height: "45px",
                  color: "#fff",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#555" },
                  "&.Mui-focused fieldset": { borderColor: "#FF9800" },
                },
                "& .MuiSvgIcon-root": { color: "#fff" },
              }}
              disabled={subcategoryOptions.length === 0}
            >
              <Select
                value={selectedSubcategory}
                displayEmpty
                onChange={(e) => setSelectedSubcategory(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Subcategories</em>
                </MenuItem>
                {subcategoryOptions.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Add new dish */}
            <Link href="/admin/dishes/new">
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
                Add New Dish
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
                    "Dish Name",
                    "Img",
                    "Price",
                    "Taste",
                    "Category",
                    "SubCategory",
                    "Status",
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
                {paginatedDishes.map((dish) => {
                  const id = dish._id || dish.id;
                  const tasteText = dish.tasteId?.name || "-";
                  const categoryText = dish.categoryId?.name || "-";
                  const subcategoryText = dish.subcategoryId?.name || "-";

                  const isThisDeleting = deletingId === id;
                  const isThisToggling = togglingId === id;
                  const isAvailable = dish.status !== "out_of_stock";

                  return (
                    <TableRow
                      key={id}
                      sx={{ "&:hover": { bgcolor: "#252525" } }}
                    >
                      <TableCell sx={{ color: "#fff" }}>
                        {dish.name}
                      </TableCell>

                      <TableCell>
                        <Image
                          src={dish.imageUrl || "/placeholder-dish.png"}
                          alt={dish.name}
                          width={50}
                          height={50}
                          style={{
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ color: "#fff" }}>
                        {dish.price}
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {tasteText}
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {categoryText}
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>
                        {subcategoryText}
                      </TableCell>

                      {/* Status with toggle */}
                      <TableCell sx={{ color: "#fff" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Switch
                            size="small"
                            checked={isAvailable}
                            onChange={() =>
                              handleToggleStatus(id, dish.status)
                            }
                            disabled={isThisDeleting || isThisToggling}
                          />
                          <span
                            style={{
                              color: isAvailable ? "#00C951" : "red",
                              fontWeight: 500,
                            }}
                          >
                            {isAvailable ? "Available" : "Out of stock"}
                          </span>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            onClick={() =>
                              router.push(`/admin/dishes/${id}`)
                            }
                            sx={{
                              fontSize: "17px",
                              color: "#00C951",
                            }}
                            disabled={isThisDeleting}
                          >
                            <FiEye />
                          </IconButton>

                          <IconButton
                            onClick={() =>
                              router.push(`/admin/dishes/edit/${id}`)
                            }
                            sx={{
                              fontSize: "17px",
                              color: "#FF9800",
                            }}
                            disabled={isThisDeleting}
                          >
                            <FiEdit2 />
                          </IconButton>

                          <IconButton
                            onClick={() => handleDelete(id, dish.name)}
                            sx={{
                              fontSize: "17px",
                              color: "#F44336",
                              opacity: isThisDeleting ? 0.5 : 1,
                            }}
                            disabled={isThisDeleting}
                          >
                            {isThisDeleting ? (
                              <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiTrash2 />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {paginatedDishes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      sx={{
                        color: "#9E9E9E",
                        textAlign: "center",
                        py: 4,
                      }}
                    >
                      No dishes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* PAGINATION */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#9E9E9E",
                "&.Mui-selected": {
                  bgcolor: "#FF9800",
                  color: "black",
                },
              },
            }}
          />
        </Box>
      </Box>
    </>
  );
}
