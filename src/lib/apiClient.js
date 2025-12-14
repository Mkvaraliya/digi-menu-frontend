// src/lib/apiClient.js
import { getToken } from "./authToken";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const isBrowser = typeof window !== "undefined";

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
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json();
}

/* ---------- PUBLIC (no auth) ---------- */

export async function apiGet(url, options = {}) {
  const res = await fetch(`${apiBase}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
    ...options,
  });
  return handleResponse(res);
}

export async function apiPost(url, data = {}, options = {}) {
  const res = await fetch(`${apiBase}${url}`, {
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
  const res = await fetch(`${apiBase}${url}`, {
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
  const res = await fetch(`${apiBase}${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  return handleResponse(res);
}

/* ---------- AUTH (uses JWT from localStorage via authToken) ---------- */

export async function apiAuthGet(url, options = {}) {
  const res = await fetch(`${apiBase}${url}`, {
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
  const res = await fetch(`${apiBase}${url}`, {
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
  const res = await fetch(`${apiBase}${url}`, {
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
  const res = await fetch(`${apiBase}${url}`, {
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

/**
 * Upload helper for FormData (file uploads).
 * IMPORTANT: do NOT set Content-Type header for multipart/form-data (browser will set with boundary).
 * We still attach Authorization header (if token present).
 *
 * Usage:
 *   const fd = new FormData(); fd.append('image', file);
 *   await apiAuthUpload('/api/owner/upload/restaurant-logo', fd);
 */
export async function apiAuthUpload(url, formData, options = {}) {
  // attach only Authorization (and any custom headers provided) — do NOT set Content-Type
  const authHeaders = withAuthHeaders(options.headers || {});

  const res = await fetch(`${apiBase}${url}`, {
    method: options.method || "POST",
    credentials: "include",
    headers: authHeaders, // only Authorization + any custom headers; browser sets multipart content-type
    body: formData,
    ...options,
  });

  return handleResponse(res);
}

export async function apiAuthDelete(url, options = {}) {
  const res = await fetch(`${apiBase}${url}`, {
    method: "DELETE",
    credentials: "include",
    headers: withAuthHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {}),
    }),
    ...options,
  });
  return handleResponse(res);
}
