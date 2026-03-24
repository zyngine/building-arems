import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
  return NextResponse.json({ isAdmin });
}
