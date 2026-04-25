import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/page-header";
import { ShopsList, type ShopListItem } from "./shops-list";

export default async function ShopsPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: shops }, { data: categories }] = await Promise.all([
    supabase
      .from("shops")
      .select("id, title_es, title_en, category, is_published, display_order")
      .order("display_order", { ascending: true }),
    supabase.from("shop_categories").select("slug, label_es, label_en"),
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
        title="Shopping"
        description="Boutiques, markets, artisans and souvenirs worth recommending."
        action={
          <Link href="/dashboard/shops/new" className="btn-accent">
            <Plus size={16} strokeWidth={2} />
            New shop
          </Link>
        }
      />

      {!shops || shops.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={20} strokeWidth={1.75} />}
          title="No shops yet"
          description="Add your favourite places to shop."
          action={
            <Link href="/dashboard/shops/new" className="btn-accent">
              <Plus size={16} strokeWidth={2} />
              Create first shop
            </Link>
          }
        />
      ) : (
        <ShopsList
          initial={(shops ?? []) as ShopListItem[]}
          categoryLabel={categoryLabel}
        />
      )}
    </div>
  );
}
