import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dispatchReviewReminders } from "@/lib/push/review-reminders";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Admin-only "Run now" trigger for the 48h review-reminder dispatch.
 * Same dispatch logic the daily cron runs — but this path uses the
 * admin's session cookie for auth rather than CRON_SECRET, so the
 * dashboard button doesn't need to know any shared secret.
 */
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

type RunReminderBody = {
  title?: string;
  body?: string;
};

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let payload: RunReminderBody = {};
    try {
      payload = (await request.json()) as RunReminderBody;
    } catch {
      // Optional body; empty is fine and falls back to saved template.
    }

    const title = payload.title?.trim();
    const body = payload.body?.trim();
    const template =
      title && body
        ? {
            title,
            body,
          }
        : undefined;

    const result = await dispatchReviewReminders(template);
    if (result.postSendError) {
      return NextResponse.json(
        { error: result.postSendError, details: result },
        { status: 500 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send reminders.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
