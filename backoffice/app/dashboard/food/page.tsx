import Link from "next/link";
import { Plus, UtensilsCrossed } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState, PageHeader } from "@/components/page-header";
import { FoodList, type FoodListItem } from "./food-list";

const PAGE_SIZE = 50;

export default async function FoodPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = createSupabaseServerClient();
  const pageRaw = Number(searchParams?.page ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const [{ data: spots, count: total }, { data: categories }] = await Promise.all([
    supabase
      .from("food_spots")
      .select(
        "id, title_es, title_en, category, is_published, display_order, is_home_taste",
        { count: "exact" }
      )
      .order("display_order", { ascending: true })
      .range(from, to),
    supabase.from("food_categories").select("slug, label_es, label_en"),
  ]);
  const categoryLabel: Record<string, string> = Object.fromEntries(
    (categories ?? []).map((c) => [
      c.slug as string,
      ((c.label_en as string) ?? (c.label_es as string)) || (c.slug as string),
    ])
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Food & drink"
        description="Restaurants, cafés, markets and street-food spots worth recommending."
        action={
          <Link href="/dashboard/food/new" className="btn-accent">
            <Plus size={16} strokeWidth={2} />
            New spot
          </Link>
        }
      />

      {(total ?? 0) === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={20} strokeWidth={1.75} />}
          title="No food spots yet"
          description="Add your favourite places to eat and drink."
          action={
            <Link href="/dashboard/food/new" className="btn-accent">
              <Plus size={16} strokeWidth={2} />
              Create first spot
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <FoodList
            initial={(spots ?? []) as FoodListItem[]}
            categoryLabel={categoryLabel}
          />
          <PaginationControls
            basePath="/dashboard/food"
            page={page}
            pageSize={PAGE_SIZE}
            total={total ?? 0}
          />
        </div>
      )}
    </div>
  );
}
