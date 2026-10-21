"use client";

// Client-side admin token store. The app is embedded in cross-site iframes,
// where cookies are unreliable (Safari ITP, Chrome third-party cookie
// blocking). So admin writes carry the session JWT in an Authorization header
// instead, which is unaffected by cookie policy. The token is kept in
// localStorage (partitioned per embed, but functional) and attached by
// adminFetch().

const TOKEN_KEY = "arems_admin_token";

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage unavailable (e.g. blocked) — cookie fallback still applies.
  }
}

export function clearAdminToken(): void {
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
