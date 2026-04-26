import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PlacesList, type PlaceListItem } from "./places-list";

const PAGE_SIZE = 50;

export default async function PlacesPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = createSupabaseServerClient();
  const pageRaw = Number(searchParams?.page ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: places, count } = await supabase
    .from("places_to_visit")
    .select(
      "id, title_es, title_en, is_published, display_order, is_home_pick, is_home_must_see",
      { count: "exact" }
    )
    .order("display_order", { ascending: true })
    .range(from, to);
  const total = count ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Places to visit"
        description="Curate the sights, monuments and neighbourhoods your tourists will explore on foot."
        action={
          <Link href="/dashboard/places/new" className="btn-accent">
            <Plus size={16} strokeWidth={2} />
            New place
          </Link>
        }
      />

      {(total ?? 0) === 0 ? (
        <EmptyState
          icon={<MapPin size={20} strokeWidth={1.75} />}
          title="No places yet"
          description="Create your first place to see it appear in the Pasion Balcanica mobile app."
          action={
            <Link href="/dashboard/places/new" className="btn-accent">
              <Plus size={16} strokeWidth={2} />
              Create first place
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <PlacesList initial={(places ?? []) as PlaceListItem[]} />
          <PaginationControls
            basePath="/dashboard/places"
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
          />
        </div>
      )}
    </div>
  );
}
