import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getJwtSecret } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin || pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("12h")
      .sign(getJwtSecret());

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
