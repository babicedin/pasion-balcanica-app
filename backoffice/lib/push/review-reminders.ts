import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  pruneInvalidTokens,
  sendLocalizedPush,
  type DeviceTokenRow,
} from "@/lib/push/fcm";

/**
 * Copy of the 48h "leave a review" push, kept here so both the cron job
 * and the admin-on-demand trigger render the exact same message.
 */
export const DEFAULT_REVIEW_REMINDER = {
  title: "How was your walk?",
  body: "30 seconds to leave a Google review — it helps other travelers find Pasión Balcánica. ⭐",
} as const;

export type ReviewReminderTemplate = {
  title: string;
  body: string;
};

export async function getReviewReminderTemplate(): Promise<ReviewReminderTemplate> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("notification_templates")
    .select("title, body")
    .eq("key", "review_reminder_48h")
    .maybeSingle();

  if (error || !data) {
    return {
      title: DEFAULT_REVIEW_REMINDER.title,
      body: DEFAULT_REVIEW_REMINDER.body,
    };
  }

  return {
    title: data.title || DEFAULT_REVIEW_REMINDER.title,
    body: data.body || DEFAULT_REVIEW_REMINDER.body,
  };
}

export async function upsertReviewReminderTemplate(input: ReviewReminderTemplate) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("notification_templates").upsert(
    {
      key: "review_reminder_48h",
      title: input.title,
      body: input.body,
    },
    { onConflict: "key" }
  );
  if (error) {
    throw new Error(`Failed to save reminder template: ${error.message}`);
  }
}

export type ReminderResult = {
  ok: boolean;
  eligible: number;
  sent: number;
  failed: number;
  pruned: number;
  /** Non-fatal error encountered after sending (logging or marking-sent failed). */
  postSendError?: string;
};

/**
 * Find devices in the 48h window (47–49 hours since install, no reminder
 * sent yet), push the localized review reminder to each, prune dead
 * tokens, mark survivors as reminded, and write a row to the
 * `notifications` audit log.
 *
 * Returns counts. Any FCM error is rethrown so the caller can map it to
 * an HTTP 502; bookkeeping errors after a successful send are reported
 * via `postSendError` so the caller can surface them without losing the
 * fact that pushes did go out.
 */
export async function dispatchReviewReminders(
  templateOverride?: ReviewReminderTemplate
): Promise<ReminderResult> {
  const admin = createSupabaseAdminClient();
  const now = new Date();
  const upper = new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString();
  const lower = new Date(now.getTime() - 49 * 60 * 60 * 1000).toISOString();

  const { data: tokens, error: queryError } = await admin
    .from("device_tokens")
    .select("id, token, locale")
    .is("review_reminder_sent_at", null)
    .gte("installed_at", lower)
    .lte("installed_at", upper);

  if (queryError) {
    throw new Error(`Failed to query reminder candidates: ${queryError.message}`);
  }

  const devices = (tokens ?? []) as DeviceTokenRow[];
  if (devices.length === 0) {
    return { ok: true, eligible: 0, sent: 0, failed: 0, pruned: 0 };
  }

  const template = templateOverride ?? (await getReviewReminderTemplate());
  const sendResult = await sendLocalizedPush({
    devices,
    title: { en: template.title, es: template.title },
    body: { en: template.body, es: template.body },
    data: { tab: "review" },
  });

  let pruned = 0;
  let postSendError: string | undefined;

  try {
    pruned = await pruneInvalidTokens(sendResult.invalidTokens);
  } catch (e) {
    postSendError =
      e instanceof Error ? e.message : "Failed to prune invalid tokens.";
  }

  const prunedSet = new Set(sendResult.invalidTokens);
  const sentIds = devices
    .filter((d) => !prunedSet.has(d.token))
    .map((d) => d.id);

  if (sentIds.length > 0) {
    const { error: markError } = await admin
      .from("device_tokens")
      .update({ review_reminder_sent_at: now.toISOString() })
      .in("id", sentIds);
    if (markError) {
      postSendError = postSendError
        ? `${postSendError}; mark-sent: ${markError.message}`
        : `Reminders sent but mark-sent failed: ${markError.message}`;
    }
  }

  const { error: logError } = await admin.from("notifications").insert({
    title_en: template.title,
    title_es: template.title,
    body_en: template.body,
    body_es: template.body,
    kind: "review_reminder",
    target_count: devices.length,
    success_count: sendResult.success,
    failure_count: sendResult.failure,
  });
  if (logError) {
    postSendError = postSendError
      ? `${postSendError}; log: ${logError.message}`
      : `Reminders sent but log insert failed: ${logError.message}`;
  }

  return {
    ok: true,
    eligible: devices.length,
    sent: sendResult.success,
    failed: sendResult.failure,
    pruned,
    postSendError,
  };
}

/**
 * Count of devices that *would* be sent a reminder if the cron ran right
 * now. Used by the admin dashboard to give a sense of "how full is the
 * pipeline" without actually firing the push.
 */
export async function countReminderCandidates(): Promise<number> {
  const admin = createSupabaseAdminClient();
  const now = new Date();
  const upper = new Date(now.getTime() - 47 * 60 * 60 * 1000).toISOString();
  const lower = new Date(now.getTime() - 49 * 60 * 60 * 1000).toISOString();

  const { count, error } = await admin
    .from("device_tokens")
    .select("id", { count: "exact", head: true })
    .is("review_reminder_sent_at", null)
    .gte("installed_at", lower)
    .lte("installed_at", upper);

  if (error) return 0;
  return count ?? 0;
}
