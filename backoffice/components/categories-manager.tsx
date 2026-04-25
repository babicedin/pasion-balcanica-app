"use client";

import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";
import { IconPicker, IconPreview, type IconGroup } from "@/components/icon-picker";
import { DragHandle, SortableList, type DragHandleProps } from "@/components/sortable-list";

export type CategoryRow = {
  slug: string;
  label_es: string;
  label_en: string;
  icon: string;
  display_order: number;
  is_published: boolean;
};

export type CategoryTable =
  | "food_categories"
  | "number_categories"
  | "shop_categories";

type DraftRow = {
  clientId: string;
  slug: string;
  label_es: string;
  label_en: string;
  icon: string;
  display_order: number;
  is_published: boolean;
  isNew: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  dirty: boolean;
};

type Props = {
  initialFood: CategoryRow[];
  initialNumbers: CategoryRow[];
  initialShops: CategoryRow[];
};

const TAB_CONFIG = [
  {
    id: "food" as const,
    label: "Food & drink",
    table: "food_categories" as const,
    iconGroup: "food" as IconGroup,
    defaultIcon: "utensils",
  },
  {
    id: "shops" as const,
    label: "Shopping",
    table: "shop_categories" as const,
    iconGroup: "shop" as IconGroup,
    defaultIcon: "shopping-bag",
  },
  {
    id: "numbers" as const,
    label: "Important numbers",
    table: "number_categories" as const,
    iconGroup: "service" as IconGroup,
    defaultIcon: "phone",
  },
];

type TabConfig = (typeof TAB_CONFIG)[number];
type TabId = TabConfig["id"];

function toDraft(row: CategoryRow): DraftRow {
  return {
    clientId: `existing-${row.slug}`,
    slug: row.slug,
    label_es: row.label_es,
    label_en: row.label_en,
    icon: row.icon,
    display_order: row.display_order,
    is_published: row.is_published,
    isNew: false,
    saving: false,
    deleting: false,
    error: null,
    dirty: false,
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `new-${crypto.randomUUID()}`;
  }
  return `new-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function CategoriesManager({
  initialFood,
  initialNumbers,
  initialShops,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("food");
  const [foodRows, setFoodRows] = useState<DraftRow[]>(() => initialFood.map(toDraft));
  const [shopRows, setShopRows] = useState<DraftRow[]>(() => initialShops.map(toDraft));
  const [numberRows, setNumberRows] = useState<DraftRow[]>(() =>
    initialNumbers.map(toDraft)
  );

  const active = TAB_CONFIG.find((t) => t.id === activeTab)!;
  const rows =
    activeTab === "food" ? foodRows : activeTab === "shops" ? shopRows : numberRows;
  const setRows =
    activeTab === "food"
      ? setFoodRows
      : activeTab === "shops"
        ? setShopRows
        : setNumberRows;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 rounded-xl bg-surface-muted border border-line p-1 w-fit">
        {TAB_CONFIG.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === t.id
                ? "bg-white text-brand-ink shadow-soft"
                : "text-neutral-500 hover:text-brand-ink"
            )}
            aria-pressed={activeTab === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      <CategorySection key={activeTab} tab={active} rows={rows} setRows={setRows} />
    </div>
  );
}

function CategorySection({
  tab,
  rows,
  setRows,
}: {
  tab: TabConfig;
  rows: DraftRow[];
  setRows: React.Dispatch<React.SetStateAction<DraftRow[]>>;
}) {
  const [reorderSaving, setReorderSaving] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const patch = useCallback(
    (clientId: string, changes: Partial<DraftRow>) => {
      setRows((prev) =>
        prev.map((r) =>
          r.clientId === clientId
            ? { ...r, ...changes, dirty: changes.dirty ?? true }
            : r
        )
      );
    },
    [setRows]
  );

  function addDraft() {
    const maxOrder = rows.reduce((acc, r) => Math.max(acc, r.display_order), -1);
    setRows((prev) => [
      ...prev,
      {
        clientId: newId(),
        slug: "",
        label_en: "",
        label_es: "",
        icon: tab.defaultIcon,
        display_order: maxOrder + 1,
        is_published: true,
        isNew: true,
        saving: false,
        deleting: false,
        error: null,
        dirty: true,
      },
    ]);
  }

  async function save(clientId: string) {
    const current = rows.find((r) => r.clientId === clientId);
    if (!current) return;

    const labelEn = current.label_en.trim();
    const labelEs = current.label_es.trim();

    if (!labelEn || !labelEs) {
      patch(clientId, { error: "Both English and Spanish labels are required." });
      return;
    }

    patch(clientId, { saving: true, error: null });
    const supabase = createSupabaseBrowserClient();

    if (current.isNew) {
      const baseSlug = slugify(labelEn) || slugify(labelEs) || `category_${Date.now()}`;
      const slug = await ensureUniqueSlug(supabase, tab.table, baseSlug);

      const { error } = await supabase.from(tab.table).insert({
        slug,
        label_en: labelEn,
        label_es: labelEs,
        icon: current.icon || tab.defaultIcon,
        display_order: current.display_order,
        is_published: current.is_published,
      });

      if (error) {
        setRows((prev) =>
          prev.map((r) =>
            r.clientId === clientId ? { ...r, saving: false, error: error.message } : r
          )
        );
        return;
      }

      setRows((prev) =>
        prev.map((r) =>
          r.clientId === clientId
            ? {
                ...r,
                slug,
                isNew: false,
                saving: false,
                dirty: false,
                error: null,
                clientId: `existing-${slug}`,
              }
            : r
        )
      );
      return;
    }

    const { error } = await supabase
      .from(tab.table)
      .update({
        label_en: labelEn,
        label_es: labelEs,
        icon: current.icon || tab.defaultIcon,
        is_published: current.is_published,
      })
      .eq("slug", current.slug);

    if (error) {
      setRows((prev) =>
        prev.map((r) =>
          r.clientId === clientId ? { ...r, saving: false, error: error.message } : r
        )
      );
      return;
    }

    setRows((prev) =>
      prev.map((r) =>
        r.clientId === clientId
          ? { ...r, saving: false, dirty: false, error: null }
          : r
      )
    );
  }

  async function remove(clientId: string) {
    const current = rows.find((r) => r.clientId === clientId);
    if (!current) return;

    if (current.isNew) {
      setRows((prev) => prev.filter((r) => r.clientId !== clientId));
      return;
    }

    if (
      !confirm(
        `Delete category “${current.label_en || current.slug}”? Items using it will fall back to the default.`
      )
    ) {
      return;
    }

    patch(clientId, { deleting: true, error: null });
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from(tab.table).delete().eq("slug", current.slug);
    if (error) {
      patch(clientId, { deleting: false, error: error.message });
      return;
    }
    setRows((prev) => prev.filter((r) => r.clientId !== clientId));
  }

  async function reorder(next: DraftRow[]) {
    const prev = rows;
    const withNewOrder = next.map((r, idx) => ({ ...r, display_order: idx }));
    setRows(withNewOrder);

    const savedRows = withNewOrder.filter((r) => !r.isNew);
    if (savedRows.length === 0) return;

    setReorderSaving(true);
    setReorderError(null);
    const supabase = createSupabaseBrowserClient();
    const results = await Promise.all(
      savedRows.map((r) =>
        supabase
          .from(tab.table)
          .update({ display_order: r.display_order })
          .eq("slug", r.slug)
      )
    );
    const firstError = results.find((res) => res.error)?.error;
    setReorderSaving(false);
    if (firstError) {
      setReorderError(firstError.message);
      setRows(prev);
    }
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <div className="card p-8 text-center text-neutral-500 text-sm">
          No categories yet. Click “Add category” below to create one.
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Drag the handle to reorder. Changes save automatically.</span>
          {reorderSaving && (
            <span className="inline-flex items-center gap-1.5 text-brand-purple">
              <Loader2 size={12} className="animate-spin" />
              Saving order…
            </span>
          )}
        </div>
      )}

      {reorderError && (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
          {reorderError}
        </div>
      )}

      <SortableList
        items={rows}
        getId={(r) => r.clientId}
        onReorder={reorder}
        renderItem={(row, handle) => (
          <CategoryRowCard
            row={row}
            handle={handle}
            iconGroup={tab.iconGroup}
            onPatch={patch}
            onSave={() => save(row.clientId)}
            onDelete={() => remove(row.clientId)}
          />
        )}
      />

      <div className="flex justify-end">
        <button type="button" onClick={addDraft} className="btn-secondary">
          <Plus size={14} strokeWidth={2} />
          Add category
        </button>
      </div>
    </div>
  );
}

function CategoryRowCard({
  row,
  handle,
  iconGroup,
  onPatch,
  onSave,
  onDelete,
}: {
  row: DraftRow;
  handle: DragHandleProps;
  iconGroup: IconGroup;
  onPatch: (clientId: string, changes: Partial<DraftRow>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "card p-4 md:p-5 space-y-4",
        row.isNew && "border-brand-purple/30 bg-brand-purple/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-6">
          <DragHandle handle={handle} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-3 items-start flex-1">
          <div className="md:w-44">
            <label className="label text-[11px]">Icon</label>
            <IconPicker
              value={row.icon}
              onChange={(slug) => onPatch(row.clientId, { icon: slug })}
              group={iconGroup}
            />
          </div>
          <div>
            <label className="label text-[11px]">Label (EN)</label>
            <input
              className="input py-2 text-sm"
              value={row.label_en}
              onChange={(e) => onPatch(row.clientId, { label_en: e.target.value })}
              placeholder="Fine dining"
            />
          </div>
          <div>
            <label className="label text-[11px]">Label (ES)</label>
            <input
              className="input py-2 text-sm"
              value={row.label_es}
              onChange={(e) => onPatch(row.clientId, { label_es: e.target.value })}
              placeholder="Alta cocina"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        {!row.isNew && (
          <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
            <span className="uppercase tracking-wider text-[10px]">slug</span>
            <span className="font-mono text-brand-ink">{row.slug}</span>
          </div>
        )}
        {row.isNew && (
          <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
            <span className="uppercase tracking-wider text-[10px]">slug</span>
            <span className="font-mono text-neutral-400">
              {slugify(row.label_en) || "auto-generated"}
            </span>
          </div>
        )}
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={row.is_published}
            onChange={(e) =>
              onPatch(row.clientId, { is_published: e.target.checked })
            }
            className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
          />
          <span className="text-xs text-neutral-600">
            {row.is_published ? "Published" : "Draft"}
          </span>
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={row.saving || row.deleting || !row.dirty}
            className="btn-accent py-1.5 text-xs"
          >
            {row.saving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {row.isNew ? "Create" : "Save"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={row.saving || row.deleting}
            className="btn-danger-ghost py-1.5 text-xs"
            title={row.isNew ? "Discard" : "Delete"}
          >
            {row.deleting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
          </button>
        </div>
      </div>

      {row.error && (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
          {row.error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1 border-t border-line/60">
        <IconPreview slug={row.icon} size={14} className="text-brand-purple" />
        <span>
          Preview: shows as <span className="text-brand-ink">{row.label_en || "—"}</span>{" "}
          / <span className="text-brand-ink">{row.label_es || "—"}</span>
        </span>
      </div>
    </div>
  );
}

/**
 * Ensure the generated slug is unique for the target table. If it collides
 * with an existing row we append a numeric suffix until we find a free one.
 */
async function ensureUniqueSlug(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  table: CategoryTable,
  base: string
): Promise<string> {
  let candidate = base;
  let suffix = 2;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("slug")
      .eq("slug", candidate)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      return candidate;
    }
    if (!data) return candidate;
    candidate = `${base}_${suffix++}`;
    if (suffix > 50) return `${base}_${Date.now()}`;
  }
}
