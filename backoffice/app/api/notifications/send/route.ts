import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  pruneInvalidTokens,
  sendLocalizedPush,
  type DeviceTokenRow,
} from "@/lib/push/fcm";

export const runtime = "nodejs";
// FCM batches can take a few seconds; bump the timeout above the default.
export const maxDuration = 60;

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

  if (!data?.is_admin) return null;
  return user;
}

type SendBody = {
  title_en?: string;
  title_es?: string;
  body_en?: string;
  body_es?: string;
};

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SendBody;
  try {
    payload = (await request.json()) as SendBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const titleEn = payload.title_en?.trim() ?? "";
  const titleEs = payload.title_es?.trim() ?? "";
  const bodyEn = payload.body_en?.trim() ?? "";
  const bodyEs = payload.body_es?.trim() ?? "";

  if (!titleEn || !titleEs || !bodyEn || !bodyEs) {
    return NextResponse.json(
      { error: "Title and body are required in both English and Spanish." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: tokens, error: tokensError } = await admin
    .from("device_tokens")
    .select("id, token, locale");

  if (tokensError) {
    return NextResponse.json({ error: tokensError.message }, { status: 500 });
  }

  const devices = (tokens ?? []) as DeviceTokenRow[];
  let result: Awaited<ReturnType<typeof sendLocalizedPush>>;
  try {
    result = await sendLocalizedPush({
      devices,
      title: { en: titleEn, es: titleEs },
      body: { en: bodyEn, es: bodyEs },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send push notification.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let pruned = 0;
  try {
    pruned = await pruneInvalidTokens(result.invalidTokens);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prune invalid tokens.";
    return NextResponse.json(
      {
        error: message,
        details: {
          targets: devices.length,
          sent: result.success,
          failed: result.failure,
        },
      },
      { status: 500 }
    );
  }

  const { error: insertError } = await admin.from("notifications").insert({
    title_en: titleEn,
    title_es: titleEs,
    body_en: bodyEn,
    body_es: bodyEs,
    kind: "broadcast",
    target_count: devices.length,
    success_count: result.success,
    failure_count: result.failure,
    sent_by: user.id,
  });
  if (insertError) {
    return NextResponse.json(
      {
        error: `Notification was sent, but logging failed: ${insertError.message}`,
        details: {
          targets: devices.length,
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
    targets: devices.length,
    sent: result.success,
    failed: result.failure,
    pruned,
  });
}
