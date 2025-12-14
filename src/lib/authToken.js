// src/lib/authToken.js
const TOKEN_KEY = "dm_token";
const USER_KEY = "dm_user";
const LEGACY_KEYS = ["token", "accessToken"]; // fallback read, but we remove them on write

export function getToken() {
  try {
    if (typeof window === "undefined") return null;
    // preferred key
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) return t;
    // fallback to legacy keys (read-only; used during migration)
    for (const k of LEGACY_KEYS) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
    return null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (typeof window === "undefined") return;
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
    // remove legacy tokens to prevent mixed-state
    for (const k of LEGACY_KEYS) localStorage.removeItem(k);
  } catch {}
}

export function clearToken() {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    for (const k of LEGACY_KEYS) localStorage.removeItem(k);
    // keep dm_user separate removal responsibility in logout flow
  } catch {}
}

export function getUserFromStorage() {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUserToStorage(user) {
  try {
    if (typeof window === "undefined") return;
    if (!user) {
      localStorage.removeItem(USER_KEY);
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function clearUserFromStorage() {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_KEY);
  } catch {}
}
