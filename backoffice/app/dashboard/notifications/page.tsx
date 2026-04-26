import { PageHeader } from "@/components/page-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { countReminderCandidates } from "@/lib/push/review-reminders";
import { ReviewReminderCard } from "./review-reminder-card";
import { NotificationsComposer, type NotificationRow } from "./composer";

export default async function NotificationsPage() {
  const supabase = createSupabaseServerClient();

  const [{ count: deviceCount }, { data: history }, reminderCandidates] =
    await Promise.all([
      supabase.from("device_tokens").select("id", { count: "exact", head: true }),
      supabase
        .from("notifications")
        .select(
          "id, kind, title_en, title_es, body_en, body_es, target_count, success_count, failure_count, sent_at"
        )
        .order("sent_at", { ascending: false })
        .limit(20),
      countReminderCandidates(),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Engagement"
        title="Push notifications"
        description="Send a broadcast to every installed device, or trigger the 48h review reminder ahead of its daily run. The mobile app picks the EN or ES variant per user."
      />

      <ReviewReminderCard eligible={reminderCandidates} />

      <NotificationsComposer
        deviceCount={deviceCount ?? 0}
        history={(history ?? []) as NotificationRow[]}
      />
    </div>
  );
}
