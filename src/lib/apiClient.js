// src/lib/apiClient.js
import { getToken } from "./authToken";

const isBrowser = typeof window !== "undefined";

/**
 * Server → API_URL
 * Client → NEXT_PUBLIC_API_URL
 */
const apiBase = isBrowser
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.API_URL;

/**
 * Final safety fallback (LOCAL DEV ONLY)
 * This will NOT be used on Vercel / Render if envs are set
 */
const BASE_URL = apiBase || "http://localhost:4000";

function withAuthHeaders(headers = {}) {
  const token = getToken();
  if (!token) return headers;

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch { }
    throw new Error(message);
  }
  return res.json();
}

/* ---------- PUBLIC (no auth) ---------- */

export async function apiGet(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store", // IMPORTANT for Render cold starts
    ...options,
  });

  return handleResponse(res);
}

export async function apiPost(url, data = {}, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(data),
    ...options,
  });

  return handleResponse(res);
}

export async function apiPut(url, data = {}, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(data),
    ...options,
  });

  return handleResponse(res);
}

export async function apiDelete(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  return handleResponse(res);
}

/* ---------- AUTH ---------- */

export async function apiAuthGet(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "GET",
    credentials: "include",
    headers: withAuthHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }),
    cache: "no-store",
    ...options,
  });

  return handleResponse(res);
}

export async function apiAuthPost(url, data = {}, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    credentials: "include",
    headers: withAuthHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }),
    body: JSON.stringify(data),
    ...options,
  });

  return handleResponse(res);
}

export async function apiAuthPut(url, data = {}, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "PUT",
    credentials: "include",
    headers: withAuthHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }),
    body: JSON.stringify(data),
    ...options,
  });

  return handleResponse(res);
}

export async function apiAuthPatch(url, data = {}, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "PATCH",
    credentials: "include",
    headers: withAuthHeaders({
      "Content-Type": "application/json", 
      ...(options.headers || {}),
    }),
    body: JSON.stringify(data),
    ...options,
  });

  return handleResponse(res);
}

/* ---------- FILE UPLOAD ---------- */

export async function apiAuthUpload(url, formData, options = {}) {
  const authHeaders = withAuthHeaders(options.headers || {});

  const res = await fetch(`${BASE_URL}${url}`, {
    method: options.method || "POST",
    credentials: "include",
    headers: authHeaders, // DO NOT set Content-Type
    body: formData,
    ...options,
  });

  return handleResponse(res);
}

export async function apiAuthDelete(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    credentials: "include",
    headers: withAuthHeaders({
      ...(options.headers || {}),
    }),
    ...options,
  });

  return handleResponse(res);
}
