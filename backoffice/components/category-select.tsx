"use client";

import Link from "next/link";
import { Loader2, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type CategoryOption = {
  slug: string;
  label_en: string;
  label_es: string;
};

type Props = {
  table: "food_categories" | "number_categories" | "shop_categories";
  value: string;
  onChange: (slug: string) => void;
  lang?: "en" | "es";
  label?: string;
  id?: string;
  required?: boolean;
};

/**
 * Dropdown of categories pulled from the given table. Shows a link to the
 * categories admin page so users can add new ones without leaving the flow.
 */
export function CategorySelect({
  table,
  value,
  onChange,
  lang = "en",
  label = "Category",
  id = "category",
  required,
}: Props) {
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from(table)
        .select("slug, label_en, label_es")
        .order("display_order", { ascending: true });
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setOptions((data ?? []) as CategoryOption[]);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [table]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label" htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-brand-red">*</span>}
        </label>
        <Link
          href="/dashboard/categories"
          className="text-xs text-brand-purple hover:text-brand-purple/80 inline-flex items-center gap-1"
        >
          <Settings2 size={12} />
          Manage
        </Link>
      </div>
      <div className="relative">
        <select
          id={id}
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          required={required}
        >
          {loading && <option>Loading categories…</option>}
          {!loading && options.length === 0 && (
            <option value="">No categories defined yet</option>
          )}
          {options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {lang === "en" ? o.label_en : o.label_es}
            </option>
          ))}
        </select>
        {loading && (
          <Loader2
            size={14}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin"
          />
        )}
      </div>
      {error && (
        <p className="text-xs text-brand-red mt-1">Failed to load: {error}</p>
      )}
    </div>
  );
}
