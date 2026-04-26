"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DragHandle, SortableList } from "@/components/sortable-list";
import { StatusBadge } from "@/components/status-badge";

export type FoodListItem = {
  id: string;
  title_en: string;
  title_es: string;
  category: string;
  is_published: boolean;
  display_order: number;
  is_home_taste: boolean;
};

export function FoodList({
  initial,
  categoryLabel,
}: {
  initial: FoodListItem[];
  categoryLabel: Record<string, string>;
}) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: FoodListItem[]) {
    const prev = items;
    const nextWithOrder = next.map((item, idx) => ({ ...item, display_order: idx }));
    setItems(nextWithOrder);
    setSaving(true);
    setError(null);
    const res = await fetch("/api/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        entity: "food",
        ids: nextWithOrder.map((item) => item.id),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      setError((detail as { error?: string }).error ?? `HTTP ${res.status}`);
      setItems(prev);
      return;
    }
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
        renderItem={(s, handle) => (
          <div className="card px-3 py-3 md:py-3.5 flex items-center gap-3 hover:border-brand-purple/30 transition-colors">
            <DragHandle handle={handle} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/food/${s.id}`}
                className="font-medium text-brand-ink hover:text-brand-purple transition-colors truncate block"
              >
                {s.title_en}
              </Link>
              <div className="text-xs text-muted truncate">
                {formatCategory(s.category)} · {s.title_es}
              </div>
              {s.is_home_taste && (
                <span className="mt-1 inline-flex rounded-full border border-brand-purple/30 bg-brand-purple/10 px-2 py-0.5 text-[10px] font-medium text-brand-purple">
                  A taste of Sarajevo
                </span>
              )}
            </div>
            <div className="flex-shrink-0">
              <StatusBadge published={s.is_published} />
            </div>
          </div>
        )}
      />
    </div>
  );
}
