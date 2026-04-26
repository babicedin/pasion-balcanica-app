import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState, PageHeader } from "@/components/page-header";
import { ShopsList, type ShopListItem } from "./shops-list";

const PAGE_SIZE = 50;

export default async function ShopsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = createSupabaseServerClient();
  const pageRaw = Number(searchParams?.page ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const [{ data: shops, count: total }, { data: categories }] = await Promise.all([
    supabase
      .from("shops")
      .select("id, title_es, title_en, category, is_published, display_order", {
        count: "exact",
      })
      .order("display_order", { ascending: true })
      .range(from, to),
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

      {(total ?? 0) === 0 ? (
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
        <div className="space-y-4">
          <ShopsList
            initial={(shops ?? []) as ShopListItem[]}
            categoryLabel={categoryLabel}
          />
          <PaginationControls
            basePath="/dashboard/shops"
            page={page}
            pageSize={PAGE_SIZE}
            total={total ?? 0}
          />
        </div>
      )}
    </div>
  );
}
