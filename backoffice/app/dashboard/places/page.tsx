import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PlacesList, type PlaceListItem } from "./places-list";

export default async function PlacesPage() {
  const supabase = createSupabaseServerClient();
  const { data: places } = await supabase
    .from("places_to_visit")
    .select("id, title_es, title_en, is_published, display_order")
    .order("display_order", { ascending: true });

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

      {!places || places.length === 0 ? (
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
        <PlacesList initial={(places ?? []) as PlaceListItem[]} />
      )}
    </div>
  );
}
