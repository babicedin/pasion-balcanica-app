import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ReorderBody = {
  entity?: "places" | "food" | "shops" | "numbers" | "reviews";
  ids?: string[];
};

const TABLE_BY_ENTITY: Record<NonNullable<ReorderBody["entity"]>, string> = {
  places: "places_to_visit",
  food: "food_spots",
  shops: "shops",
  numbers: "important_numbers",
  reviews: "reviews",
};

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  return data?.is_admin ? user : null;
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ReorderBody;
  try {
    body = (await request.json()) as ReorderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const entity = body.entity;
  const ids = body.ids ?? [];
  if (!entity || !TABLE_BY_ENTITY[entity] || ids.length === 0) {
    return NextResponse.json(
      { error: "Entity and non-empty ids[] are required." },
      { status: 400 }
    );
  }
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json(
      { error: "ids[] must not contain duplicates." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc("reorder_content", {
    p_table: TABLE_BY_ENTITY[entity],
    p_ids: ids,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
