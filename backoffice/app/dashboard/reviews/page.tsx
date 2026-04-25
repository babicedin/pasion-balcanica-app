import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ReviewsList, type ReviewListItem } from "./reviews-list";

export default async function ReviewsPage() {
  const supabase = createSupabaseServerClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, quote_es, quote_en, author, rating, source_url, source, source_review_url, external_review_id, is_published, display_order, fetched_at"
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  const { data: syncRuns } = await supabase
    .from("review_sync_runs")
    .select("status, reviews_fetched, reviews_upserted, error_message, finished_at")
    .order("started_at", { ascending: false })
    .limit(1);
  const latestSync = syncRuns?.[0] ?? null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Reviews"
        description="Reviews are imported from Google and cached in Supabase. Use Sync now to refresh and publish/unpublish individual rows."
      />

      <ReviewsList
        initial={(reviews ?? []) as ReviewListItem[]}
        latestSync={latestSync}
      />
    </div>
  );
}
