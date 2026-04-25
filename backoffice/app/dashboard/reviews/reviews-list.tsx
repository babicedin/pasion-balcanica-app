"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Star, Trash2 } from "lucide-react";
import { DragHandle, SortableList } from "@/components/sortable-list";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type ReviewListItem = {
  id: string;
  quote_es: string;
  quote_en: string;
  author: string;
  rating: number;
  source_url: string | null;
  source: "manual" | "google_scraper";
  source_review_url: string | null;
  external_review_id: string | null;
  is_published: boolean;
  display_order: number;
  fetched_at: string | null;
};

type LatestSync = {
  status: "running" | "success" | "failed";
  reviews_fetched: number;
  reviews_upserted: number;
  error_message: string | null;
  finished_at: string | null;
} | null;

function formatSarajevoTime(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sarajevo",
  }).format(date);
}

export function ReviewsList({
  initial,
  latestSync,
}: {
  initial: ReviewListItem[];
  latestSync: LatestSync;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finishedAtSarajevo = formatSarajevoTime(latestSync?.finished_at ?? null);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const statusTone =
    latestSync?.status === "success"
      ? "bg-emerald-100 text-emerald-700"
      : latestSync?.status === "failed"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";

  async function persist(next: ReviewListItem[]) {
    const prev = items;
    setItems(next);
    setSaving(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const results = await Promise.all(
      next.map((item, idx) =>
        supabase.from("reviews").update({ display_order: idx }).eq("id", item.id)
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

  async function triggerSync() {
    setSyncing(true);
    setError(null);
    const response = await fetch("/api/reviews/sync", { method: "POST" });
    setSyncing(false);
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Sync failed.");
      return;
    }
    router.refresh();
  }

  async function togglePublished(item: ReviewListItem, next: boolean) {
    setError(null);
    const prev = items;
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, is_published: next } : entry
      )
    );

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("reviews")
      .update({ is_published: next })
      .eq("id", item.id);

    if (updateError) {
      setError(updateError.message);
      setItems(prev);
      return;
    }
    router.refresh();
  }

  async function deleteReview(item: ReviewListItem) {
    if (!confirm(`Delete review by ${item.author || "anonymous"}?`)) return;
    setError(null);
    const prev = items;
    setItems((current) => current.filter((entry) => entry.id !== item.id));

    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError(deleteError.message);
      setItems(prev);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="card px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand-ink">Google sync</p>
            <p className="text-xs text-neutral-500">
              Pull latest Google reviews and update cached records.
            </p>
          </div>
          <button
            type="button"
            className="btn-accent"
            disabled={syncing}
            onClick={triggerSync}
          >
            {syncing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Sync now
              </>
            )}
          </button>
        </div>
        {latestSync ? (
          <div className="text-xs text-neutral-600">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone}`}
            >
              {latestSync.status}
            </span>
            <span className="ml-2">
              fetched {latestSync.reviews_fetched}, upserted{" "}
              {latestSync.reviews_upserted}
              {finishedAtSarajevo ? ` · ${finishedAtSarajevo} (Sarajevo)` : ""}
              {latestSync.error_message ? ` · ${latestSync.error_message}` : ""}
            </span>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">
            No sync runs yet. Click Sync now to import reviews.
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          Drag to reorder display. Use Published toggle to control mobile
          visibility.
        </span>
        {saving && (
          <span className="inline-flex items-center gap-1.5 text-brand-purple">
            <Loader2 size={12} className="animate-spin" />
            Saving order…
          </span>
        )}
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-line bg-surface-muted/40 px-4 py-6 text-sm text-neutral-600">
          No imported reviews yet. Click <span className="font-medium">Sync now</span>{" "}
          to fetch from Google.
        </div>
      )}

      <SortableList
        items={items}
        getId={(i) => i.id}
        onReorder={persist}
        renderItem={(r, handle) => {
          const preview =
            (r.quote_en || r.quote_es || "").trim() || "(empty quote)";
          return (
            <div className="card px-3 py-3 md:py-3.5 flex items-center gap-3 hover:border-brand-purple/30 transition-colors">
              <DragHandle handle={handle} />
              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-surface-muted grid place-items-center text-brand-purple">
                <Star size={16} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-brand-ink truncate">
                  {r.author || "(anonymous)"}
                </p>
                <div className="text-xs text-muted truncate">{preview}</div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  {r.source === "google_scraper" ? "Google import" : "Manual"}{" "}
                  {r.source_review_url && (
                    <a
                      className="text-brand-purple hover:underline"
                      href={r.source_review_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      source
                    </a>
                  )}
                </div>
              </div>
              <div
                className="hidden sm:flex items-center gap-0.5 flex-shrink-0 text-amber-500"
                aria-label={`${r.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    strokeWidth={1.75}
                    className={
                      i < r.rating ? "fill-current" : "text-neutral-300"
                    }
                  />
                ))}
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={r.is_published}
                  onChange={(e) => togglePublished(r, e.target.checked)}
                  className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
                />
                Published
              </label>
              <button
                type="button"
                onClick={() => deleteReview(r)}
                className="p-2 rounded-md text-brand-red hover:bg-brand-red/10 transition-colors"
                aria-label="Delete review"
                title="Delete review"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        }}
      />
    </div>
  );
}
