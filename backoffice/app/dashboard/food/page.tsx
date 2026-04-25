import Link from "next/link";
import { Plus, UtensilsCrossed } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/page-header";
import { FoodList, type FoodListItem } from "./food-list";

export default async function FoodPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: spots }, { data: categories }] = await Promise.all([
    supabase
      .from("food_spots")
      .select("id, title_es, title_en, category, is_published, display_order")
      .order("display_order", { ascending: true }),
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

      {!spots || spots.length === 0 ? (
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
        <FoodList
          initial={(spots ?? []) as FoodListItem[]}
          categoryLabel={categoryLabel}
        />
      )}
    </div>
  );
}
