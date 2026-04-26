import { NextRequest, NextResponse } from "next/server";

import { dispatchReviewReminders } from "@/lib/push/review-reminders";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily cron job. Vercel hits this endpoint on the schedule defined in
 * vercel.json. Auth: either Vercel's built-in `x-vercel-cron` header or
 * a manual `Authorization: Bearer <CRON_SECRET>` for ad-hoc curl tests.
 *
 * Picks devices that registered between 47 and 49 hours ago and haven't
 * been pinged yet, sends them a localized "leave a review" push, prunes
 * dead tokens, and marks the rest as reminded.
 */
function isAuthorized(request: NextRequest): {
  ok: boolean;
  status?: number;
  error?: string;
} {
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

export async function GET(request: NextRequest) {
  const auth = isAuthorized(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error ?? "Unauthorized" },
      { status: auth.status ?? 401 }
    );
  }

  try {
    const result = await dispatchReviewReminders();
    if (result.postSendError) {
      // Pushes went out, but bookkeeping had a problem. Surface it as 500
      // with the partial result so the cron log captures both facts.
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
