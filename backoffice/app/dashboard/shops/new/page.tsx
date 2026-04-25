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
import { LocationPicker, type LocationValue } from "@/components/location-picker";
import { MediaLinksEditor } from "@/components/media-links-editor";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const EMPTY: BilingualValues = {
  title: { en: "", es: "" },
  kicker: { en: "", es: "" },
  description: { en: "", es: "" },
};

export default function NewShopPage() {
  return (
    <BilingualProvider initialValues={EMPTY}>
      <NewShopForm />
    </BilingualProvider>
  );
}

function NewShopForm() {
  const router = useRouter();
  const { values } = useBilingual();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("souvenirs");
  const [location, setLocation] = useState<LocationValue>({
    latitude: null,
    longitude: null,
    address: null,
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const titleEn = values.title?.en.trim() ?? "";
    const titleEs = values.title?.es.trim() ?? "";

    if (!titleEn || !titleEs) {
      setError(
        "Both English and Spanish titles are required. Use Copy EN → ES to start from the English text."
      );
      setSaving(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data: tail } = await supabase
      .from("shops")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);
    const nextOrder = ((tail?.[0]?.display_order as number | undefined) ?? -1) + 1;

    const payload = {
      title_en: titleEn,
      title_es: titleEs,
      kicker_en: values.kicker?.en.trim() ?? "",
      kicker_es: values.kicker?.es.trim() ?? "",
      description_en: values.description?.en.trim() ?? "",
      description_es: values.description?.es.trim() ?? "",
      category,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      phone: phone.trim() || null,
      photo_urls: photoUrls.map((x) => x.trim()).filter(Boolean),
      youtube_urls: youtubeUrls.map((x) => x.trim()).filter(Boolean),
      display_order: nextOrder,
      is_published: isPublished,
    };

    const { error } = await supabase.from("shops").insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard/shops");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Add new shop"
        description="Create a boutique, market, artisan or souvenir recommendation."
        action={
          <Link href="/dashboard/shops" className="btn-secondary">
            <ArrowLeft size={16} />
            Back to shopping
          </Link>
        }
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card p-6 md:p-7 space-y-5">
          <LanguageTabs />

          <BilingualInput name="title" label="Title" required />
          <BilingualInput
            name="kicker"
            label="Kicker"
            placeholder="Baščaršija · since 1898"
          />
          <BilingualTextarea name="description" label="Description" rows={5} />
        </div>

        <div className="card p-6 md:p-7 space-y-5">
          <LocationPicker value={location} onChange={setLocation} />
          <div>
            <label htmlFor="shop-phone" className="label">
              Phone
            </label>
            <input
              id="shop-phone"
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+387 33 123 456"
            />
            <p className="text-xs text-muted mt-1">
              Optional. Powers the Call CTA on the shop&rsquo;s detail screen.
            </p>
          </div>
        </div>

        <MediaLinksEditor
          photoUrls={photoUrls}
          onPhotoUrlsChange={setPhotoUrls}
          youtubeUrls={youtubeUrls}
          onYoutubeUrlsChange={setYoutubeUrls}
        />

        <div className="card p-6 md:p-7 space-y-5">
          <CategorySelect
            table="shop_categories"
            value={category}
            onChange={setCategory}
            lang="en"
            required
          />
          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
            />
            Published
          </label>
          <p className="text-xs text-muted">
            Order is set by drag-and-drop on the shopping list. New items are
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
                Save shop
              </>
            )}
          </button>
          <Link href="/dashboard/shops" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
