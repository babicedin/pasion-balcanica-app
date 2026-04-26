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

export default function NewFoodSpotPage() {
  return (
    <BilingualProvider initialValues={EMPTY}>
      <NewFoodSpotForm />
    </BilingualProvider>
  );
}

function NewFoodSpotForm() {
  const router = useRouter();
  const { values } = useBilingual();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("restaurant");
  const [location, setLocation] = useState<LocationValue>({
    latitude: null,
    longitude: null,
    address: null,
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isHomeTaste, setIsHomeTaste] = useState(false);

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
      .from("food_spots")
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
      is_home_taste: isHomeTaste,
    };

    const { error } = await supabase.from("food_spots").insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard/food");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Add new food spot"
        description="Create a restaurant, cafe, market or other recommendation."
        action={
          <Link href="/dashboard/food" className="btn-secondary">
            <ArrowLeft size={16} />
            Back to food
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
            placeholder="Baščaršija · since 1971"
          />
          <BilingualTextarea name="description" label="Description" rows={5} />
        </div>

        <div className="card p-6 md:p-7 space-y-5">
          <LocationPicker value={location} onChange={setLocation} />
          <div>
            <label htmlFor="food-phone" className="label">
              Phone
            </label>
            <input
              id="food-phone"
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+387 33 123 456"
            />
            <p className="text-xs text-muted mt-1">
              Optional. Powers the Call CTA on the spot&rsquo;s detail screen.
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
            table="food_categories"
            value={category}
            onChange={setCategory}
            lang="en"
            required
          />
          <div>
            <p className="text-sm font-medium text-brand-ink">Visibility & home curation</p>
            <p className="text-xs text-muted mt-1">
              Pick whether this spot is visible and featured on the home screen.
            </p>
          </div>
          <div className="space-y-2">
            <label className="flex items-start gap-3 rounded-xl border border-line/70 bg-brand-paper px-3 py-2.5 text-sm text-neutral-700 hover:border-brand-purple/30 transition-colors">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
              />
              <span>
                <span className="font-medium text-brand-ink">Published</span>
                <span className="block text-xs text-muted mt-0.5">
                  Shows this food spot in the mobile app.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-line/70 bg-brand-paper px-3 py-2.5 text-sm text-neutral-700 hover:border-brand-purple/30 transition-colors">
              <input
                type="checkbox"
                checked={isHomeTaste}
                onChange={(e) => setIsHomeTaste(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
              />
              <span>
                <span className="font-medium text-brand-ink">A taste of Sarajevo section</span>
                <span className="block text-xs text-muted mt-0.5">
                  Includes this spot in the home food highlights.
                </span>
              </span>
            </label>
          </div>
          <p className="text-xs text-muted">
            Order is set by drag-and-drop on the food list. New items are
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
                Save spot
              </>
            )}
          </button>
          <Link href="/dashboard/food" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
