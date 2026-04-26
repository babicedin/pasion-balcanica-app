import { PageHeader } from "@/components/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  countReminderCandidates,
  getReviewReminderTemplate,
} from "@/lib/push/review-reminders";
import { ReviewReminderCard } from "./review-reminder-card";
import { NotificationsComposer, type NotificationRow } from "./composer";

export default async function NotificationsPage() {
  const supabase = createSupabaseServerClient();

  const [activeDevicesResult, { data: history }, reminderCandidates, template] =
    await Promise.all([
      supabase
        .from("device_tokens")
        .select("id", { count: "exact", head: true })
        .gte(
          "last_seen_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        ),
      supabase
        .from("notifications")
        .select(
          "id, kind, title_en, title_es, body_en, body_es, target_count, success_count, failure_count, sent_at"
        )
        .order("sent_at", { ascending: false })
        .limit(20),
      countReminderCandidates(),
      getReviewReminderTemplate(),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Engagement"
        title="Push notifications"
        description="Edit the automatic 48h review reminder, or send an immediate one-off notification to active devices."
      />

      <ReviewReminderCard
        eligible={reminderCandidates}
        initialTitle={template.title}
        initialBody={template.body}
      />

      <NotificationsComposer
        deviceCount={activeDevicesResult.count ?? 0}
        history={(history ?? []) as NotificationRow[]}
      />
    </div>
  );
}
