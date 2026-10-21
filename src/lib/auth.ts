import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SALT = "arems-building-naming-rights-2026";

export const SESSION_COOKIE = "admin_session";

// Options for the admin session cookie. The app is embedded in cross-site
// iframes (see `frame-ancestors *` in next.config), and a SameSite=Strict/Lax
// cookie is never sent in that context — so admin writes would 401 when
// embedded. SameSite=None + Secure makes the cookie flow in the iframe, and
// Partitioned (CHIPS) keeps it working under third-party-cookie blocking.
// Locally we fall back to Lax over http, where Secure cookies aren't stored.
export function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    partitioned: isProd,
    path: "/",
  };
}

export function getJwtSecret(): Uint8Array {
  const pin = process.env.ADMIN_PIN;
  if (!pin) throw new Error("ADMIN_PIN not configured");
  return new TextEncoder().encode(pin + SALT);
}

export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    const pin = process.env.ADMIN_PIN;
    if (!pin) return false;
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}
