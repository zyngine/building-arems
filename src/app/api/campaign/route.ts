import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { verifyAdminRequest } from "@/lib/auth";

// PUT — update campaign settings (currently the manual adjustment to the
// total raised). Admin only.
export async function PUT(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const amount = Number(body.manual_adjustment);

    if (!Number.isInteger(amount)) {
      return NextResponse.json(
        { error: "manual_adjustment must be a whole number of cents" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Resolve the single settings row if the client didn't pass an id.
    let id: string | undefined = body.id;
    if (!id) {
      const { data: row } = await supabase
        .from("campaign_settings")
        .select("id")
        .limit(1)
        .single();
      id = row?.id;
    }

    if (!id) {
      return NextResponse.json(
        { error: "No campaign settings row found" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("campaign_settings")
      .update({
        manual_adjustment: amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
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
