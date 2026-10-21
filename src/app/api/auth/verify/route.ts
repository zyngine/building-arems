import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getJwtSecret, getSessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";

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

    // Return the token so the client can send it as a bearer header on admin
    // writes (reliable inside cross-site iframes). The cookie is still set for
    // direct, non-embedded use.
    const response = NextResponse.json({ success: true, token });
    response.cookies.set(SESSION_COOKIE, token, {
      ...getSessionCookieOptions(),
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
