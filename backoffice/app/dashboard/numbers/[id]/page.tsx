"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  BilingualInput,
  BilingualProvider,
  BilingualTextarea,
  LanguageTabs,
  makeBilingualInitial,
  useBilingual,
  type BilingualValues,
} from "@/components/bilingual-form";
import { CategorySelect } from "@/components/category-select";
import { IconPicker } from "@/components/icon-picker";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NumberRow = {
  id: string;
  label_es: string;
  label_en: string;
  phone_number: string;
  category: string;
  icon: string | null;
  description_es: string | null;
  description_en: string | null;
  display_order: number;
  is_published: boolean;
};

export default function EditNumberPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<NumberRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("important_numbers")
        .select(
          "id, label_es, label_en, phone_number, category, icon, description_es, description_en, display_order, is_published"
        )
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (error) setError(error.message);
      setRecord(data as NumberRow | null);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="card p-8 flex items-center gap-2 text-neutral-600">
        <Loader2 size={16} className="animate-spin" />
        Loading number...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Content"
          title="Number not found"
          action={
            <Link href="/dashboard/numbers" className="btn-secondary">
              <ArrowLeft size={16} />
              Back to numbers
            </Link>
          }
        />
        {error && (
          <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
            {error}
          </div>
        )}
      </div>
    );
  }

  const initial: BilingualValues = makeBilingualInitial({
    label: { en: record.label_en, es: record.label_es },
    description: { en: record.description_en, es: record.description_es },
  });

  return (
    <BilingualProvider initialValues={initial}>
      <EditNumberForm record={record} router={router} />
    </BilingualProvider>
  );
}

function EditNumberForm({
  record,
  router,
}: {
  record: NumberRow;
  router: ReturnType<typeof useRouter>;
}) {
  const { values } = useBilingual();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState(record.phone_number);
  const [category, setCategory] = useState(record.category ?? "other");
  const [icon, setIcon] = useState(record.icon ?? "phone");
  const [isPublished, setIsPublished] = useState(record.is_published);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const labelEn = values.label?.en.trim() ?? "";
    const labelEs = values.label?.es.trim() ?? "";

    if (!labelEn || !labelEs || !phone.trim()) {
      setError("Please provide labels (EN/ES) and a phone number.");
      setSaving(false);
      return;
    }

    const payload = {
      label_en: labelEn,
      label_es: labelEs,
      description_en: values.description?.en.trim() ?? "",
      description_es: values.description?.es.trim() ?? "",
      phone_number: phone.trim(),
      category,
      icon: icon.trim() || "phone",
      is_published: isPublished,
    };

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("important_numbers")
      .update(payload)
      .eq("id", record.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard/numbers");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this number? This action cannot be undone.")) return;
    setDeleting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("important_numbers").delete().eq("id", record.id);

    if (error) {
      setError(error.message);
      setDeleting(false);
      return;
    }

    router.push("/dashboard/numbers");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title={`Edit number: ${record.label_en}`}
        description="Update labels, phone, category and publication status."
        action={
          <Link href="/dashboard/numbers" className="btn-secondary">
            <ArrowLeft size={16} />
            Back to numbers
          </Link>
        }
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card p-6 md:p-7 space-y-5">
          <LanguageTabs />

          <BilingualInput name="label" label="Label" required />
          <BilingualTextarea name="description" label="Description" rows={3} />
        </div>

        <div className="card p-6 md:p-7 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="label" htmlFor="phone_number">
              Phone number <span className="text-brand-red">*</span>
            </label>
            <input
              id="phone_number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="+387…"
              required
            />
          </div>
          <CategorySelect
            table="number_categories"
            value={category}
            onChange={setCategory}
            lang="en"
            required
          />
          <div>
            <label className="label" htmlFor="icon">
              Icon
            </label>
            <IconPicker
              id="icon"
              value={icon}
              onChange={setIcon}
              group="service"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-700 md:col-span-3">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
            />
            Published
          </label>
          <p className="text-xs text-muted md:col-span-3">
            Order is managed by drag-and-drop on the numbers list.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={saving || deleting} className="btn-accent">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={saving || deleting}
            className="btn-danger-ghost"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete number
              </>
            )}
          </button>
          <Link href="/dashboard/numbers" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
