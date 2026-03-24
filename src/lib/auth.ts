import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SALT = "arems-building-naming-rights-2026";

export function getJwtSecret(): Uint8Array {
  const pin = process.env.ADMIN_PIN;
  if (!pin) throw new Error("ADMIN_PIN not configured");
  return new TextEncoder().encode(pin + SALT);
}

export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session")?.value;
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
