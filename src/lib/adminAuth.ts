"use client";

// Client-side admin token store. The app is embedded in cross-site iframes,
// where cookies are unreliable (Safari ITP, Chrome third-party cookie
// blocking). So admin writes carry the session JWT in an Authorization header
// instead, which is unaffected by cookie policy. The token is kept in
// localStorage (partitioned per embed, but functional) and attached by
// adminFetch().

const TOKEN_KEY = "arems_admin_token";

// Kept in memory as the primary source so the token survives even when
// localStorage is blocked in the embedded iframe (Safari/Chrome storage
// partitioning). localStorage is a best-effort persistence layer on top, so
// the session can survive a reload where storage is allowed.
let memoryToken: string | null = null;

export function getAdminToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    memoryToken = localStorage.getItem(TOKEN_KEY);
    return memoryToken;
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  memoryToken = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage unavailable (e.g. blocked) — in-memory token still applies.
  }
}

export function clearAdminToken(): void {
  memoryToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// fetch() wrapper that attaches the admin bearer token when present.
export function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
