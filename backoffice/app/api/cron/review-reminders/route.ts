import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  pruneInvalidTokens,
  sendLocalizedPush,
  type DeviceTokenRow,
} from "@/lib/push/fcm";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily cron job. Vercel hits this endpoint with a Bearer token equal to
 * `CRON_SECRET`. We also accept Vercel's built-in cron header so a manual
 * "Run now" from the Vercel dashboard works without juggling secrets.
 *
 * Picks devices that registered between 47 and 49 hours ago and haven't
 * been pinged yet, sends them a localized "leave a review" push, then
 * marks them as reminded so we don't double-fire.
 */
function isAuthorized(request: NextRequest): { ok: boolean; status?: number; error?: string } {
  // Vercel includes this header on platform cron invocations.
  if (request.headers.get("x-vercel-cron")) return { ok: true };

  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return {
      ok: false,
      status: 500,
      error: "CRON_SECRET is not configured.",
    };
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth === `Bearer ${expected}`) return { ok: true };
  return { ok: false, status: 401, error: "Unauthorized" };
}

const REVIEW_REMINDER = {
  title: {
    en: "How was your walk?",
    es: "¿Cómo fue tu caminata?",
  },
  body: {
    en: "30 seconds to leave a Google review — it helps other travelers find Pasión Balcánica. ⭐",
    es: "30 segundos para dejar una reseña en Google — ayuda a otros viajeros a encontrar Pasión Balcánica. ⭐",
  },
} as const;

export async function GET(request: NextRequest) {
  const auth = isAuthorized(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error ?? "Unauthorized" },
      { status: auth.status ?? 401 }
    );
  }

  const admin = createSupabaseAdminClient();
  const now = new Date();
  const upper = new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString();
  const lower = new Date(now.getTime() - 49 * 60 * 60 * 1000).toISOString();

  const { data: tokens, error } = await admin
    .from("device_tokens")
    .select("id, token, locale")
    .is("review_reminder_sent_at", null)
    .gte("installed_at", lower)
    .lte("installed_at", upper);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const devices = (tokens ?? []) as DeviceTokenRow[];
  if (devices.length === 0) {
    return NextResponse.json({ ok: true, eligible: 0 });
  }

  let result: Awaited<ReturnType<typeof sendLocalizedPush>>;
  try {
    result = await sendLocalizedPush({
      devices,
      title: REVIEW_REMINDER.title,
      body: REVIEW_REMINDER.body,
      // Deep-link payload the mobile push handler reads on tap.
      data: { tab: "review" },
    });
  } catch (sendError) {
    const message =
      sendError instanceof Error ? sendError.message : "Failed to send reminders.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let pruned = 0;
  try {
    pruned = await pruneInvalidTokens(result.invalidTokens);
  } catch (pruneError) {
    const message =
      pruneError instanceof Error
        ? pruneError.message
        : "Failed to prune invalid reminder tokens.";
    return NextResponse.json(
      {
        error: message,
        details: {
          eligible: devices.length,
          sent: result.success,
          failed: result.failure,
        },
      },
      { status: 500 }
    );
  }

  // Mark the surviving (non-pruned) tokens as reminded so they don't keep
  // qualifying for future runs.
  const prunedSet = new Set(result.invalidTokens);
  const sentIds = devices
    .filter((d) => !prunedSet.has(d.token))
    .map((d) => d.id);

  if (sentIds.length > 0) {
    const { error: markSentError } = await admin
      .from("device_tokens")
      .update({ review_reminder_sent_at: now.toISOString() })
      .in("id", sentIds);
    if (markSentError) {
      return NextResponse.json(
        {
          error: `Reminders were sent but marking rows failed: ${markSentError.message}`,
          details: {
            eligible: devices.length,
            sent: result.success,
            failed: result.failure,
            pruned,
          },
        },
        { status: 500 }
      );
    }
  }

  const { error: logError } = await admin.from("notifications").insert({
    title_en: REVIEW_REMINDER.title.en,
    title_es: REVIEW_REMINDER.title.es,
    body_en: REVIEW_REMINDER.body.en,
    body_es: REVIEW_REMINDER.body.es,
    kind: "review_reminder",
    target_count: devices.length,
    success_count: result.success,
    failure_count: result.failure,
  });
  if (logError) {
    return NextResponse.json(
      {
        error: `Reminders were sent, but logging failed: ${logError.message}`,
        details: {
          eligible: devices.length,
          sent: result.success,
          failed: result.failure,
          pruned,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    eligible: devices.length,
    sent: result.success,
    failed: result.failure,
    pruned,
  });
}
