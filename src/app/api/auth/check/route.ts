import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SALT = "arems-building-naming-rights-2026";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.json({ isAdmin: false });
  }

  try {
    const pin = process.env.ADMIN_PIN;
    if (!pin) return NextResponse.json({ isAdmin: false });
    const secret = new TextEncoder().encode(pin + SALT);
    await jwtVerify(token, secret);
    return NextResponse.json({ isAdmin: true });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
