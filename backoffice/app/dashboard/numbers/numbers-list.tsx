"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DragHandle, SortableList } from "@/components/sortable-list";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { IconPreview } from "@/components/icon-picker";

export type NumberListItem = {
  id: string;
  label_en: string;
  label_es: string;
  phone_number: string;
  category: string;
  icon: string | null;
  is_published: boolean;
  display_order: number;
};

export function NumbersList({
  initial,
  categoryLabel,
}: {
  initial: NumberListItem[];
  categoryLabel: Record<string, string>;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: NumberListItem[]) {
    const prev = items;
    setItems(next);
    setSaving(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const results = await Promise.all(
      next.map((item, idx) =>
        supabase
          .from("important_numbers")
          .update({ display_order: idx })
          .eq("id", item.id)
      )
    );
    const firstError = results.find((r) => r.error)?.error;
    setSaving(false);
    if (firstError) {
      setError(firstError.message);
      setItems(prev);
      return;
    }
    router.refresh();
  }

  const formatCategory = (slug: string) =>
    categoryLabel[slug] ?? slug.replace(/_/g, " ");

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>Drag the handle to reorder. Changes save automatically.</span>
        {saving && (
          <span className="inline-flex items-center gap-1.5 text-brand-purple">
            <Loader2 size={12} className="animate-spin" />
            Saving order…
          </span>
        )}
      </div>

      <SortableList
        items={items}
        getId={(i) => i.id}
        onReorder={persist}
        renderItem={(n, handle) => (
          <div className="card px-3 py-3 md:py-3.5 flex items-center gap-3 hover:border-brand-purple/30 transition-colors">
            <DragHandle handle={handle} />
            <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-surface-muted grid place-items-center text-brand-purple">
              <IconPreview slug={n.icon ?? "phone"} size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/numbers/${n.id}`}
                className="font-medium text-brand-ink hover:text-brand-purple transition-colors truncate block"
              >
                {n.label_en}
              </Link>
              <div className="text-xs text-muted truncate">
                {formatCategory(n.category)} · {n.label_es}
              </div>
            </div>
            <a
              href={`tel:${n.phone_number}`}
              className="hidden sm:inline font-mono text-sm text-neutral-700 hover:text-brand-purple transition-colors flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {n.phone_number}
            </a>
          </div>
        )}
      />
    </div>
  );
}
