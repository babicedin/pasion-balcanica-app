"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  BilingualInput,
  BilingualProvider,
  BilingualTextarea,
  LanguageTabs,
  useBilingual,
  type BilingualValues,
} from "@/components/bilingual-form";
import { CategorySelect } from "@/components/category-select";
import { IconPicker } from "@/components/icon-picker";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const EMPTY: BilingualValues = {
  label: { en: "", es: "" },
  description: { en: "", es: "" },
};

export default function NewNumberPage() {
  return (
    <BilingualProvider initialValues={EMPTY}>
      <NewNumberForm />
    </BilingualProvider>
  );
}

function NewNumberForm() {
  const router = useRouter();
  const { values } = useBilingual();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("other");
  const [icon, setIcon] = useState("phone");
  const [isPublished, setIsPublished] = useState(true);

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

    const supabase = createSupabaseBrowserClient();
    const { data: tail } = await supabase
      .from("important_numbers")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    const nextOrder = ((tail?.[0]?.display_order as number | undefined) ?? -1) + 1;

    const payload = {
      label_en: labelEn,
      label_es: labelEs,
      description_en: values.description?.en.trim() ?? "",
      description_es: values.description?.es.trim() ?? "",
      phone_number: phone.trim(),
      category,
      icon: icon.trim() || "phone",
      display_order: nextOrder,
      is_published: isPublished,
    };

    const { error } = await supabase.from("important_numbers").insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard/numbers");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Add new number"
        description="Create emergency, transport or other useful numbers for travellers."
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
            Order is set by drag-and-drop on the numbers list. New items are
            appended to the end.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className="btn-accent">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save number
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
