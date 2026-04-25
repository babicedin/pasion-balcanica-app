"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DragHandle, SortableList } from "@/components/sortable-list";
import { StatusBadge } from "@/components/status-badge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type PlaceListItem = {
  id: string;
  title_en: string;
  title_es: string;
  is_published: boolean;
  display_order: number;
};

export function PlacesList({ initial }: { initial: PlaceListItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: PlaceListItem[]) {
    const prev = items;
    setItems(next);
    setSaving(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const updates = next
      .map((item, idx) => ({ id: item.id, display_order: idx }))
      .filter((u, idx) => prev[idx]?.id !== u.id || prev[idx]?.display_order !== u.display_order);
    const results = await Promise.all(
      updates.map((u) =>
        supabase
          .from("places_to_visit")
          .update({ display_order: u.display_order })
          .eq("id", u.id)
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
        renderItem={(p, handle) => (
          <div className="card px-3 py-3 md:py-3.5 flex items-center gap-3 hover:border-brand-purple/30 transition-colors">
            <DragHandle handle={handle} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/places/${p.id}`}
                className="font-medium text-brand-ink hover:text-brand-purple transition-colors truncate block"
              >
                {p.title_en}
              </Link>
              <div className="text-xs text-muted truncate">{p.title_es}</div>
            </div>
            <div className="flex-shrink-0">
              <StatusBadge published={p.is_published} />
            </div>
          </div>
        )}
      />
    </div>
  );
}
