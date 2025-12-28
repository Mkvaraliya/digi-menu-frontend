"use client";

import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import {
  apiAuthGet,
  apiAuthPost,
  apiAuthDelete,
  apiAuthPut,
} from "@/lib/apiClient";
import { toast } from "sonner";

export default function MenuSetupPage() {
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [tastes, setTastes] = useState([]);
  const [gravies, setGravies] = useState([]);

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newSubParent, setNewSubParent] = useState("");
  const [newTaste, setNewTaste] = useState("");
  const [newGravy, setNewGravy] = useState("");

  const [editing, setEditing] = useState(null); // { type, id }
  const [editingValue, setEditingValue] = useState("");

  /* ───────── Load all ───────── */
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        const [catRes, tasteRes, gravyRes] = await Promise.all([
          apiAuthGet("/api/owner/categories"),
          apiAuthGet("/api/owner/tastes"),
          apiAuthGet("/api/owner/gravies"),
        ]);

        const catData = catRes.data || [];
        setCategories(catData);
        setTastes(tasteRes.data || []);
        setGravies(gravyRes.data || []);

        if (catData.length > 0) setNewSubParent(catData[0]._id);

        const subs = await Promise.all(
          catData.map((c) =>
            apiAuthGet(`/api/owner/categories/${c._id}/subcategories`)
              .then((r) => r.data || [])
              .catch(() => [])
          )
        );

        setSubcategories(subs.flat());
      } catch (e) {
        console.error(e);
        toast.error("Failed to load menu setup");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  /* ───────── Edit helpers ───────── */
  const startEdit = (type, item) => {
    setEditing({ type, id: item._id });
    setEditingValue(item.name);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditingValue("");
  };

  const saveEdit = async () => {
    if (!editingValue.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const { type, id } = editing;

    const endpointMap = {
      categories: `/api/owner/categories/${id}`,
      subcategories: `/api/owner/subcategories/${id}`,
      tastes: `/api/owner/tastes/${id}`,
      gravies: `/api/owner/gravies/${id}`,
    };

    try {
      await apiAuthPut(endpointMap[type], {
        name: editingValue.trim(),
      });

      const update = (setter) =>
        setter((prev) =>
          prev.map((i) =>
            i._id === id ? { ...i, name: editingValue.trim() } : i
          )
        );

      if (type === "categories") update(setCategories);
      if (type === "subcategories") update(setSubcategories);
      if (type === "tastes") update(setTastes);
      if (type === "gravies") update(setGravies);

      toast.success("Updated successfully");
      cancelEdit();
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  };

  /* ───────── Row renderer ───────── */
  const renderRow = (item, type, onDelete) => {
    const isEditing = editing?.id === item._id && editing.type === type;

    return (
      <div
        key={item._id}
        className="flex items-center justify-between bg-[#121212] px-3 py-2 rounded"
      >
        {isEditing ? (
          <input
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="flex-1 bg-[#181818] border border-[#2A2A2A] px-2 py-1 rounded mr-2"
          />
        ) : (
          <div className="text-sm">{item.name}</div>
        )}

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={saveEdit} className="text-green-400">
                <FiCheck />
              </button>
              <button onClick={cancelEdit} className="text-gray-400">
                <FiX />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(type, item)}
                className="text-blue-400"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="text-red-400"
              >
                <FiTrash2 />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen px-6 py-6 text-white">
      <h2 className="text-xl font-semibold mb-6">Menu Setup</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <Section
            title="Categories"
            value={newCategory}
            setValue={setNewCategory}
            onAdd={() =>
              apiAuthPost("/api/owner/categories", { name: newCategory }).then(
                (r) => {
                  setCategories((p) => [...p, r.data]);
                  setNewCategory("");
                }
              )
            }
          >
            {categories.map((c) =>
              renderRow(c, "categories", (id) =>
                apiAuthDelete(`/api/owner/categories/${id}`).then(() =>
                  setCategories((p) => p.filter((x) => x._id !== id))
                )
              )
            )}
          </Section>

          {/* Tastes */}
          <Section
            title="Tastes"
            value={newTaste}
            setValue={setNewTaste}
            onAdd={() =>
              apiAuthPost("/api/owner/tastes", { name: newTaste }).then((r) => {
                setTastes((p) => [...p, r.data]);
                setNewTaste("");
              })
            }
          >
            {tastes.map((t) =>
              renderRow(t, "tastes", (id) =>
                apiAuthDelete(`/api/owner/tastes/${id}`).then(() =>
                  setTastes((p) => p.filter((x) => x._id !== id))
                )
              )
            )}
          </Section>

          {/* Gravies */}
          <Section
            title="Gravies"
            value={newGravy}
            setValue={setNewGravy}
            onAdd={() =>
              apiAuthPost("/api/owner/gravies", { name: newGravy }).then((r) => {
                setGravies((p) => [...p, r.data]);
                setNewGravy("");
              })
            }
          >
            {gravies.map((g) =>
              renderRow(g, "gravies", (id) =>
                apiAuthDelete(`/api/owner/gravies/${id}`).then(() =>
                  setGravies((p) => p.filter((x) => x._id !== id))
                )
              )
            )}
          </Section>
        </div>

        {/* RIGHT: Subcategories */}
        <div className="lg:col-span-2 bg-[#0f0f0f] p-4 rounded">
          <h3 className="text-sm font-semibold mb-2">Subcategories</h3>

          <div className="flex gap-2 mb-3">
            <select
              value={newSubParent}
              onChange={(e) => setNewSubParent(e.target.value)}
              className="bg-[#181818] border border-[#2A2A2A] px-2 py-2 rounded"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              value={newSubcategory}
              onChange={(e) => setNewSubcategory(e.target.value)}
              placeholder="New subcategory"
              className="flex-1 bg-[#181818] border border-[#2A2A2A] px-2 py-2 rounded"
            />

            <button
              onClick={() =>
                apiAuthPost(
                  `/api/owner/categories/${newSubParent}/subcategories`,
                  { name: newSubcategory }
                ).then((r) => {
                  setSubcategories((p) => [...p, r.data]);
                  setNewSubcategory("");
                })
              }
              className="bg-[#ffb300] px-3 rounded text-black"
            >
              <FiPlus />
            </button>
          </div>

          <div className="space-y-2">
            {subcategories.map((sc) =>
              renderRow(sc, "subcategories", (id) =>
                apiAuthDelete(`/api/owner/subcategories/${id}`).then(() =>
                  setSubcategories((p) => p.filter((x) => x._id !== id))
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, value, setValue, onAdd, children }) {
  return (
    <div className="bg-[#0f0f0f] p-4 rounded">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="flex gap-2 mb-3">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 bg-[#181818] border border-[#2A2A2A] px-2 py-2 rounded"
        />
        <button
          onClick={onAdd}
          className="bg-[#ffb300] px-3 rounded text-black"
        >
          <FiPlus />
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
