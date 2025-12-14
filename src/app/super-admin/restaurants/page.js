// // src/app/super-admin/restaurants/page.jsx
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { apiAuthGet, apiAuthPost, apiAuthDelete, apiAuthPut } from "@/lib/apiClient";
// import { toast } from "sonner"; // optional, use your toast or replace with alert()
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// /**
//  * Simple utilities
//  */
// const formatDate = (d) => {
//   if (!d) return "-";
//   try {
//     return new Date(d).toLocaleDateString();
//   } catch { return String(d); }
// };

// /**
//  * Single-page restaurant list for super-admin
//  */
// export default function RestaurantsPage() {
//   const router = useRouter();

//   const [items, setItems] = useState([]);
//   const [total, setTotal] = useState(0);

//   const [page, setPage] = useState(1);
//   const [limit] = useState(12);

//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [city, setCity] = useState("");
//   const [expiringOnly, setExpiringOnly] = useState(false);
//   const [expiringDays] = useState(7); // dropdown later

//   // small UI state for action buttons
//   const [impersonatingId, setImpersonatingId] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);
//   const [resettingId, setResettingId] = useState(null);

//   // fetch restaurants
//   const fetch = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       params.set("page", page);
//       params.set("limit", limit);
//       if (search) params.set("q", search);
//       if (city) params.set("city", city);
//       if (expiringOnly) params.set("expiringInDays", String(expiringDays));

//       const url = `/api/super-admin/restaurants?${params.toString()}`;
//       const res = await apiAuthGet(url);
//       const data = res.data || {};
//       setItems(data.items || []);
//       setTotal(Number(data.total || 0));
//     } catch (err) {
//       console.error("Failed to load restaurants:", err);
//       toast?.error?.(err.message || "Failed to load restaurants");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetch();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, search, city, expiringOnly]);

//   const pageCount = Math.max(1, Math.ceil(total / limit));

//   // UI actions
//   const handleDelete = async (id) => {
//     if (!confirm("Are you sure? This will mark the restaurant deleted (soft-delete).")) return;
//     try {
//       setDeletingId(id);
//       await apiAuthDelete(`/api/super-admin/restaurants/${id}`);
//       toast?.success?.("Restaurant deleted");
//       // refresh
//       fetch();
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast?.error?.(err.message || "Delete failed");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const handleResetPassword = async (id) => {
//     const newPassword = prompt("Enter new password for owner (will force reset on next login):");
//     if (!newPassword) return;
//     try {
//       setResettingId(id);
//       await apiAuthPost(`/api/super-admin/restaurants/${id}/reset-password`, { newPassword });
//       toast?.success?.("Owner password updated");
//     } catch (err) {
//       console.error("Reset failed:", err);
//       toast?.error?.(err.message || "Reset failed");
//     } finally {
//       setResettingId(null);
//     }
//   };

//   const handleImpersonate = async (id) => {
//     try {
//       setImpersonatingId(id);
//       const res = await apiAuthPost(`/api/super-admin/restaurants/${id}/impersonate`);
//       const { token, adminUrl } = res.data || res || {};
//       if (!token) {
//         toast?.error("Impersonation failed: no token returned");
//         return;
//       }
//       // Option A: redirect to admin panel with token as query param (admin should read and set)
//       // NOTE: your admin panel must implement reading `impersonateToken` from query and set it to localStorage/cookie
//       const target = (adminUrl || "/admin") + `?impersonateToken=${encodeURIComponent(token)}`;
//       window.open(target, "_blank");
//       toast?.success?.("Impersonation opened in new tab (short-lived token)");
//     } catch (err) {
//       console.error("Impersonate failed:", err);
//       toast?.error?.(err.message || "Impersonate failed");
//     } finally {
//       setImpersonatingId(null);
//     }
//   };

//   // quick toggle active/inactive (updates isActive)
//   const handleToggleActive = async (id, current) => {
//     try {
//       await apiAuthPut(`/api/super-admin/restaurants/${id}`, { isActive: !current });
//       toast?.success?.("Status updated");
//       fetch();
//     } catch (err) {
//       console.error("Toggle failed:", err);
//       toast?.error?.(err.message || "Update failed");
//     }
//   };

//   // derive list of cities for filter
//   const cityOptions = useMemo(() => {
//     const set = new Set(items.map((i) => i.city).filter(Boolean));
//     return Array.from(set).sort();
//   }, [items]);

//   return (
//     <div className="min-h-screen p-6 bg-[#0b0b0b] text-white">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-semibold">Restaurants</h1>

//           <div className="flex gap-3">
//             <Link href="/super-admin/restaurants/create">
//               <button className="px-4 py-2 bg-[#FFA900] text-black rounded">Create</button>
//             </Link>
//             <button
//               className="px-4 py-2 border border-[#333] rounded"
//               onClick={() => fetch()}
//               disabled={loading}
//             >
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-[#0f0f0f] p-4 rounded mb-4 flex flex-col md:flex-row gap-3 md:items-center">
//           <input
//             placeholder="Search name / phone / email"
//             value={search}
//             onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             className="px-3 py-2 rounded bg-[#171717] border border-[#222] flex-1"
//           />

//           <select
//             value={city}
//             onChange={(e) => { setCity(e.target.value); setPage(1); }}
//             className="px-3 py-2 rounded bg-[#171717] border border-[#222]"
//           >
//             <option value="">All cities</option>
//             {cityOptions.map((c) => (
//               <option key={c} value={c}>{c}</option>
//             ))}
//           </select>

//           <label className="flex items-center gap-2 ml-auto">
//             <input
//               type="checkbox"
//               checked={expiringOnly}
//               onChange={(e) => { setExpiringOnly(e.target.checked); setPage(1); }}
//             />
//             <span className="text-sm text-[#cfcfcf]">Expiring in {expiringDays} days</span>
//           </label>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto rounded bg-[#0f0f0f] border border-[#222]">
//           <table className="min-w-full table-auto">
//             <thead className="bg-[#111]">
//               <tr>
//                 <th className="px-4 py-3 text-left">Name</th>
//                 <th className="px-4 py-3 text-left hidden md:table-cell">City</th>
//                 <th className="px-4 py-3 text-left hidden lg:table-cell">Phone / Email</th>
//                 <th className="px-4 py-3 text-left">Plan expiry</th>
//                 <th className="px-4 py-3 text-left">Status</th>
//                 <th className="px-4 py-3 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr><td colSpan={6} className="p-6 text-center">Loading…</td></tr>
//               ) : items.length === 0 ? (
//                 <tr><td colSpan={6} className="p-6 text-center text-[#9a9a9a]">No restaurants found</td></tr>
//               ) : items.map((r) => {
//                 const id = r._id || r.id;
//                 const isExpiring = r.planExpiryDate && new Date(r.planExpiryDate) <= new Date(Date.now() + (expiringDays*24*60*60*1000));
//                 return (
//                   <tr key={id} className="border-t border-[#222] hover:bg-[#141414]">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded overflow-hidden bg-[#222] flex items-center justify-center">
//                           {r.logoUrl ? (
//                             // eslint-disable-next-line @next/next/no-img-element
//                             <img src={r.logoUrl} alt={r.name} className="object-cover w-full h-full" />
//                           ) : (
//                             <div className="text-xs text-[#888]">No logo</div>
//                           )}
//                         </div>
//                         <div>
//                           <div className="font-medium">{r.name}</div>
//                           <div className="text-xs text-[#9a9a9a]">/{r.slug}</div>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="px-4 py-3 hidden md:table-cell">{r.city || "-"}</td>

//                     <td className="px-4 py-3 hidden lg:table-cell">
//                       <div className="text-sm">{r.phone || "-"}</div>
//                       <div className="text-xs text-[#9a9a9a]">{r.email || "-"}</div>
//                     </td>

//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <div>{formatDate(r.planExpiryDate)}</div>
//                         {isExpiring && <div className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">Expiring</div>}
//                         {r.planExpiryDate && new Date(r.planExpiryDate) < new Date() && <div className="text-xs bg-red-600 px-2 py-0.5 rounded">Expired</div>}
//                       </div>
//                     </td>

//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <button
//                           className={`px-2 py-1 rounded text-sm ${r.isActive ? "bg-emerald-600 text-black" : "bg-gray-700 text-white"}`}
//                           onClick={() => handleToggleActive(id, r.isActive)}
//                         >
//                           {r.isActive ? "Active" : "Inactive"}
//                         </button>
//                       </div>
//                     </td>

//                     <td className="px-4 py-3">
//                       <div className="flex gap-2 flex-wrap">
//                         <Link href={`/super-admin/restaurants/${id}`} className="px-3 py-1 border rounded text-sm">View</Link>
//                         <Link href={`/super-admin/restaurants/${id}/edit`} className="px-3 py-1 border rounded text-sm">Edit</Link>

//                         <button
//                           className="px-3 py-1 border rounded text-sm bg-[#FFD8A8] text-black"
//                           onClick={() => handleImpersonate(id)}
//                           disabled={impersonatingId === id}
//                         >
//                           {impersonatingId === id ? "Opening…" : "Impersonate"}
//                         </button>

//                         <button
//                           className="px-3 py-1 border rounded text-sm"
//                           onClick={() => handleResetPassword(id)}
//                           disabled={resettingId === id}
//                         >
//                           {resettingId === id ? "Resetting…" : "Reset Pass"}
//                         </button>

//                         <button
//                           className="px-3 py-1 border rounded text-sm text-red-500"
//                           onClick={() => handleDelete(id)}
//                           disabled={deletingId === id}
//                         >
//                           {deletingId === id ? "Deleting…" : "Delete"}
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="mt-4 flex items-center justify-between">
//           <div className="text-sm text-[#9a9a9a]">Total: {total}</div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-3 py-1 border rounded"
//             >
//               Prev
//             </button>
//             <div className="px-3 py-1 border rounded bg-[#0b0b0b]">{page} / {pageCount}</div>
//             <button
//               onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
//               disabled={page === pageCount}
//               className="px-3 py-1 border rounded"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from 'react'

const page = () => {
  return (
    <div>go back dear!</div>
  )
}

export default page