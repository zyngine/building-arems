import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { verifyAdminRequest } from "@/lib/auth";

// POST — create a new donation
export async function POST(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("donations")
      .insert({
        room_id: body.room_id,
        donor_name: body.donor_name,
        dedication_text: body.dedication_text || null,
        status: body.status || "pledged",
        donor_phone: body.donor_phone || null,
        donor_email: body.donor_email || null,
        donor_address: body.donor_address || null,
        pledge_amount: body.pledge_amount || null,
        payment_method: body.payment_method || null,
        internal_notes: body.internal_notes || null,
        updated_by: body.updated_by || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT — update an existing donation
export async function PUT(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("donations")
      .update({
        donor_name: body.donor_name,
        dedication_text: body.dedication_text || null,
        status: body.status,
        donor_phone: body.donor_phone || null,
        donor_email: body.donor_email || null,
        donor_address: body.donor_address || null,
        pledge_amount: body.pledge_amount || null,
        payment_method: body.payment_method || null,
        internal_notes: body.internal_notes || null,
        updated_by: body.updated_by || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — remove a donation (reset room to available)
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing donation id" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("donations")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
