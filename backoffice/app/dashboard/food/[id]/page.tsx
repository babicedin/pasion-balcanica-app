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
import { LocationPicker, type LocationValue } from "@/components/location-picker";
import { MediaLinksEditor } from "@/components/media-links-editor";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type FoodRow = {
  id: string;
  title_es: string;
  title_en: string;
  kicker_es: string | null;
  kicker_en: string | null;
  description_es: string | null;
  description_en: string | null;
  category: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  photo_urls: string[] | null;
  youtube_urls: string[] | null;
  display_order: number;
  is_published: boolean;
  is_home_taste: boolean;
};

export default function EditFoodSpotPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<FoodRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("food_spots")
        .select(
          "id, title_es, title_en, kicker_es, kicker_en, description_es, description_en, category, address, latitude, longitude, phone, photo_urls, youtube_urls, display_order, is_published"
          + ", is_home_taste"
        )
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;
      if (error) setError(error.message);
      setRecord(data as FoodRow | null);
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
        Loading food spot...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Content"
          title="Food spot not found"
          action={
            <Link href="/dashboard/food" className="btn-secondary">
              <ArrowLeft size={16} />
              Back to food
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
    title: { en: record.title_en, es: record.title_es },
    kicker: { en: record.kicker_en, es: record.kicker_es },
    description: { en: record.description_en, es: record.description_es },
  });

  return (
    <BilingualProvider initialValues={initial}>
      <EditFoodSpotForm record={record} router={router} />
    </BilingualProvider>
  );
}

function EditFoodSpotForm({
  record,
  router,
}: {
  record: FoodRow;
  router: ReturnType<typeof useRouter>;
}) {
  const { values } = useBilingual();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(record.category ?? "restaurant");
  const [location, setLocation] = useState<LocationValue>({
    latitude: record.latitude,
    longitude: record.longitude,
    address: record.address,
  });
  const [photoUrls, setPhotoUrls] = useState<string[]>(record.photo_urls ?? []);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(record.youtube_urls ?? []);
  const [phone, setPhone] = useState<string>(record.phone ?? "");
  const [isPublished, setIsPublished] = useState(record.is_published);
  const [isHomeTaste, setIsHomeTaste] = useState(record.is_home_taste);

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
      is_published: isPublished,
      is_home_taste: isHomeTaste,
    };

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("food_spots").update(payload).eq("id", record.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard/food");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this food spot? This action cannot be undone.")) return;
    setDeleting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("food_spots").delete().eq("id", record.id);

    if (error) {
      setError(error.message);
      setDeleting(false);
      return;
    }

    router.push("/dashboard/food");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title={`Edit spot: ${record.title_en}`}
        description="Update titles, descriptions, category and publication status."
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
          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
            />
            Published
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isHomeTaste}
              onChange={(e) => setIsHomeTaste(e.target.checked)}
              className="h-4 w-4 rounded border-line text-brand-purple focus:ring-brand-purple/30"
            />
            A taste of Sarajevo (home section)
          </label>
          <p className="text-xs text-muted">
            Order is managed by drag-and-drop on the food list.
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
                Delete spot
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
