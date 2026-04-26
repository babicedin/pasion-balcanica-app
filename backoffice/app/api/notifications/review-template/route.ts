import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getReviewReminderTemplate,
  upsertReviewReminderTemplate,
} from "@/lib/push/review-reminders";

export const runtime = "nodejs";

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return Boolean(data?.is_admin);
}

type TemplateBody = {
  title?: string;
  body?: string;
};

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getReviewReminderTemplate());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load template.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: TemplateBody;
  try {
    payload = (await request.json()) as TemplateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = payload.title?.trim() ?? "";
  const body = payload.body?.trim() ?? "";
  if (!title || !body) {
    return NextResponse.json(
      { error: "Title and body are required." },
      { status: 400 }
    );
  }

  try {
    await upsertReviewReminderTemplate({ title, body });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save template.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
