import Link from "next/link";
import { Phone, Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState, PageHeader } from "@/components/page-header";
import { NumbersList, type NumberListItem } from "./numbers-list";

const PAGE_SIZE = 50;

export default async function NumbersPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = createSupabaseServerClient();
  const pageRaw = Number(searchParams?.page ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const [{ data: numbers, count: total }, { data: categories }] = await Promise.all([
    supabase
      .from("important_numbers")
      .select(
        "id, label_es, label_en, phone_number, category, icon, is_published, display_order",
        { count: "exact" }
      )
      .order("display_order", { ascending: true })
      .range(from, to),
    supabase.from("number_categories").select("slug, label_es, label_en"),
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
        title="Important numbers"
        description="Emergency, transport and tourist-information contacts travellers can reach with one tap."
        action={
          <Link href="/dashboard/numbers/new" className="btn-accent">
            <Plus size={16} strokeWidth={2} />
            New number
          </Link>
        }
      />

      {(total ?? 0) === 0 ? (
        <EmptyState
          icon={<Phone size={20} strokeWidth={1.75} />}
          title="No numbers yet"
          description="Running the seed migration adds Sarajevo's common contacts. You can also add your own."
          action={
            <Link href="/dashboard/numbers/new" className="btn-accent">
              <Plus size={16} strokeWidth={2} />
              Create first number
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <NumbersList
            initial={(numbers ?? []) as NumberListItem[]}
            categoryLabel={categoryLabel}
          />
          <PaginationControls
            basePath="/dashboard/numbers"
            page={page}
            pageSize={PAGE_SIZE}
            total={total ?? 0}
          />
        </div>
      )}
    </div>
  );
}
