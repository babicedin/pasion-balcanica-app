"use client";

import {
  ImagePlus,
  Loader2,
  Save,
  Star,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
// NOTE: the old "Stats" card (walkers / rating / years) has been removed
// from the UI — those fields still exist in the DB but are no longer
// surfaced in the mobile app, so we also stopped editing them here.
import { FormEvent, useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
  BilingualInput,
  BilingualProvider,
  BilingualTextarea,
  LanguageTabs,
  makeBilingualInitial,
  useBilingual,
} from "@/components/bilingual-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Single row in `public.about_section` — the consolidated source of truth
 * for everything the mobile app's About + Review + Home-teaser screens
 * render. Previously split across `site_settings`, but migration 0007
 * merged them here.
 */
export type AboutRow = {
  id: number;
  guide_name: string;
  guide_tagline_en: string;
  guide_tagline_es: string;
  body_en: string;
  body_es: string;
  image_url: string | null;
  stat_walkers: string;
  stat_rating: string;
  stat_years: string;
  google_review_url: string | null;
  booking_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
  share_url: string | null;
};

export function AboutEditor({ initial }: { initial: AboutRow }) {
  const initialValues = makeBilingualInitial({
    tagline: {
      en: initial.guide_tagline_en,
      es: initial.guide_tagline_es,
    },
    body: { en: initial.body_en, es: initial.body_es },
  });

  return (
    <BilingualProvider initialValues={initialValues}>
      <AboutForm initial={initial} />
    </BilingualProvider>
  );
}

function AboutForm({ initial }: { initial: AboutRow }) {
  const { values } = useBilingual();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(initial.image_url);
  const [guideName, setGuideName] = useState(initial.guide_name);
  // Stats (walkers / rating / years) are no longer surfaced in the mobile
  // app, but we preserve whatever was saved previously by passing it back
  // through on submit — dropping them here would wipe real data.
  const statWalkers = initial.stat_walkers;
  const statRating = initial.stat_rating;
  const statYears = initial.stat_years;
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    initial.google_review_url ?? ""
  );
  const [bookingUrl, setBookingUrl] = useState(initial.booking_url ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initial.instagram_url ?? "");
  const [whatsappUrl, setWhatsappUrl] = useState(initial.whatsapp_url ?? "");
  const [shareUrl, setShareUrl] = useState(initial.share_url ?? "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      guide_name: guideName.trim() || "Valentina",
      guide_tagline_en: (values.tagline?.en ?? "").trim(),
      guide_tagline_es: (values.tagline?.es ?? "").trim(),
      body_en: (values.body?.en ?? "").trim(),
      body_es: (values.body?.es ?? "").trim(),
      image_url: imageUrl,
      // Preserve historical values for these (no longer UI-editable).
      stat_walkers: statWalkers.trim(),
      stat_rating: statRating.trim(),
      stat_years: statYears.trim(),
      google_review_url: googleReviewUrl.trim() || null,
      booking_url: bookingUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
      whatsapp_url: whatsappUrl.trim() || null,
      share_url: shareUrl.trim() || null,
    };

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("about_section")
      .update(payload)
      .eq("id", 1);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSavedAt(new Date());
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Site & About"
        description="Everything the mobile app shows for the guide: portrait, bio, stats, and the primary CTA links (booking, Google review, Instagram, WhatsApp, share)."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card p-6 md:p-7 space-y-5">
          <LanguageTabs />
          <div>
            <label htmlFor="guide_name" className="label">
              Guide name
            </label>
            <input
              id="guide_name"
              className="input"
              value={guideName}
              onChange={(e) => setGuideName(e.target.value)}
              placeholder="Valentina"
            />
            <p className="text-xs text-muted mt-1">
              Shown on the home teaser and as the headline on the About
              screen.
            </p>
          </div>
          <BilingualInput
            name="tagline"
            label="Tagline"
            placeholder="Free walking tour guide, Sarajevo"
          />
          <BilingualTextarea
            name="body"
            label="About text"
            placeholder="Tell travelers who you are and why you love guiding in Sarajevo..."
            rows={8}
          />
        </div>

        <div className="card p-6 md:p-7 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-purple/10 text-brand-purple grid place-items-center">
              <User size={16} strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-brand-ink">Portrait</h3>
              <p className="text-xs text-muted mt-1">
                Shown on the About hero card. Square or 4:3 images work best.
              </p>
            </div>
          </div>
          <SingleImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>

        <div className="card p-6 md:p-7 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-purple/10 text-brand-purple grid place-items-center">
              <Star size={16} strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-brand-ink">
                CTA links
              </h3>
              <p className="text-xs text-muted mt-1">
                Each URL powers one button in the mobile app. Leave blank to
                hide the action.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <UrlField
              id="booking_url"
              label="Booking URL"
              value={bookingUrl}
              onChange={setBookingUrl}
              placeholder="https://..."
              helper="Used by the “Book a walk” button on the About screen."
            />
            <UrlField
              id="google_review_url"
              label="Google review URL"
              value={googleReviewUrl}
              onChange={setGoogleReviewUrl}
              placeholder="https://g.page/r/..."
              helper="Used by the primary button on the Review screen."
            />
            <UrlField
              id="instagram_url"
              label="Instagram URL"
              value={instagramUrl}
              onChange={setInstagramUrl}
              placeholder="https://instagram.com/..."
              helper="Instagram tile on the Review screen."
            />
            <UrlField
              id="whatsapp_url"
              label="WhatsApp URL"
              value={whatsappUrl}
              onChange={setWhatsappUrl}
              placeholder="https://wa.me/..."
              helper="WhatsApp tile on the Review screen."
            />
            <UrlField
              id="share_url"
              label="Share URL"
              value={shareUrl}
              onChange={setShareUrl}
              placeholder="https://..."
              helper="Fallback link used by the Share tile on the Review screen."
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving} className="btn-accent">
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
          {savedAt && !saving && (
            <span className="text-xs text-neutral-500">
              Saved at {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function UrlField({
  id,
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type="url"
        inputMode="url"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {helper && <p className="text-xs text-muted mt-1">{helper}</p>}
    </div>
  );
}

function SingleImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function onUploadFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `about/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
      const { error } = await supabase.storage
        .from("place-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw new Error(`${file.name}: ${error.message}`);

      const { data } = supabase.storage.from("place-images").getPublicUrl(path);
      if (data?.publicUrl) onChange(data.publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function openFilePicker() {
    const input = fileInputRef.current;
    if (!input) return;
    input.value = "";
    input.click();
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          void onUploadFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      {value ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-line bg-surface-muted w-full sm:w-60 aspect-[4/3]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${value}")` }}
            />
          </div>
          <div className="flex flex-col gap-2 justify-center">
            <button
              type="button"
              className="btn-secondary py-2 text-sm"
              onClick={openFilePicker}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Replace image
                </>
              )}
            </button>
            <button
              type="button"
              className="btn-danger-ghost py-2 text-sm"
              onClick={() => onChange(null)}
              disabled={uploading}
            >
              <Trash2 size={14} />
              Remove image
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            void onUploadFiles(e.dataTransfer.files);
          }}
          className={cn(
            "w-full rounded-2xl border border-dashed px-4 py-10 text-center transition-colors",
            dragActive
              ? "border-brand-purple bg-brand-purple/5"
              : "border-line bg-surface-muted/40 hover:bg-surface-muted"
          )}
          disabled={uploading}
        >
          <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-white border border-line grid place-items-center text-brand-purple">
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ImagePlus size={18} />
            )}
          </div>
          <p className="text-sm font-medium text-brand-ink">
            {uploading ? "Uploading image..." : "Drop an image or click to upload"}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            PNG, JPG, WEBP or AVIF up to 10MB
          </p>
        </button>
      )}

      {uploadError && (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red flex items-start gap-2">
          <X size={14} className="mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
