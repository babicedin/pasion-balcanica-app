import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaginationControls } from "@/components/pagination-controls";
import { PageHeader } from "@/components/page-header";
import { ReviewsList, type ReviewListItem } from "./reviews-list";

const PAGE_SIZE = 50;

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = createSupabaseServerClient();
  const pageRaw = Number(searchParams?.page ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: reviews, count: total } = await supabase
    .from("reviews")
    .select(
      "id, quote_es, quote_en, author, rating, source_url, source, source_review_url, external_review_id, is_published, display_order, fetched_at",
      { count: "exact" }
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);
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

      <div className="space-y-4">
        <ReviewsList
          initial={(reviews ?? []) as ReviewListItem[]}
          latestSync={latestSync}
        />
        <PaginationControls
          basePath="/dashboard/reviews"
          page={page}
          pageSize={PAGE_SIZE}
          total={total ?? 0}
        />
      </div>
    </div>
  );
}
