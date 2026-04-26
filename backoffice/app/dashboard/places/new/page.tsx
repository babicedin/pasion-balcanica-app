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
import { LocationPicker, type LocationValue } from "@/components/location-picker";
import { MediaLinksEditor } from "@/components/media-links-editor";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const EMPTY: BilingualValues = {
  title: { en: "", es: "" },
  kicker: { en: "", es: "" },
  description: { en: "", es: "" },
};

export default function NewPlacePage() {
  return (
    <BilingualProvider initialValues={EMPTY}>
      <NewPlaceForm />
    </BilingualProvider>
  );
}

function NewPlaceForm() {
  const router = useRouter();
  const { values } = useBilingual();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationValue>({
    latitude: null,
    longitude: null,
    address: null,
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [isHomePick, setIsHomePick] = useState(false);
  const [isHomeMustSee, setIsHomeMustSee] = useState(false);

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
      .from("places_to_visit")
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
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      photo_urls: photoUrls.map((x) => x.trim()).filter(Boolean),
      youtube_urls: youtubeUrls.map((x) => x.trim()).filter(Boolean),
      display_order: nextOrder,
      is_published: isPublished,
      is_home_pick: isHomePick,
      is_home_must_see: isHomeMustSee,
    };

    const { error } = await supabase.from("places_to_visit").insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard/places");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Add new place"
        description="Create a place that will appear in the mobile app when published."
        action={
          <Link href="/dashboard/places" className="btn-secondary">
            <ArrowLeft size={16} />
            Back to places
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
            placeholder="Historic · Stari Grad"
          />
          <BilingualTextarea name="description" label="Description" rows={5} />
        </div>

        <div className="card p-6 md:p-7">
          <LocationPicker value={location} onChange={setLocation} />
        </div>

        <MediaLinksEditor
          photoUrls={photoUrls}
          onPhotoUrlsChange={setPhotoUrls}
          youtubeUrls={youtubeUrls}
          onYoutubeUrlsChange={setYoutubeUrls}
        />

        <div className="card p-6 md:p-7">
          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="is_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
            />
            Published
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isHomePick}
              onChange={(e) => setIsHomePick(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
            />
            Today&apos;s pick (home hero badge)
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isHomeMustSee}
              onChange={(e) => setIsHomeMustSee(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
            />
            Must-see places (home section)
          </label>
          <p className="text-xs text-muted mt-2">
            Order is set by drag-and-drop on the places list. New items are
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
                Save place
              </>
            )}
          </button>
          <Link href="/dashboard/places" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
