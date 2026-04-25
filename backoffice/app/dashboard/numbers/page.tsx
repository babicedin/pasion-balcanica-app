import Link from "next/link";
import { Phone, Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/page-header";
import { NumbersList, type NumberListItem } from "./numbers-list";

export default async function NumbersPage() {
  const supabase = createSupabaseServerClient();
  const [{ data: numbers }, { data: categories }] = await Promise.all([
    supabase
      .from("important_numbers")
      .select(
        "id, label_es, label_en, phone_number, category, icon, is_published, display_order"
      )
      .order("display_order", { ascending: true }),
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

      {!numbers || numbers.length === 0 ? (
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
        <NumbersList
          initial={(numbers ?? []) as NumberListItem[]}
          categoryLabel={categoryLabel}
        />
      )}
    </div>
  );
}
