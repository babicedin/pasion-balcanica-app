"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DragHandle, SortableList } from "@/components/sortable-list";
import { StatusBadge } from "@/components/status-badge";

export type ShopListItem = {
  id: string;
  title_en: string;
  title_es: string;
  category: string;
  is_published: boolean;
  display_order: number;
};

export function ShopsList({
  initial,
  categoryLabel,
}: {
  initial: ShopListItem[];
  categoryLabel: Record<string, string>;
}) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: ShopListItem[]) {
    const prev = items;
    const nextWithOrder = next.map((item, idx) => ({ ...item, display_order: idx }));
    setItems(nextWithOrder);
    setSaving(true);
    setError(null);
    const res = await fetch("/api/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        entity: "shops",
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
                href={`/dashboard/shops/${s.id}`}
                className="font-medium text-brand-ink hover:text-brand-purple transition-colors truncate block"
              >
                {s.title_en}
              </Link>
              <div className="text-xs text-muted truncate">
                {formatCategory(s.category)} · {s.title_es}
              </div>
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
