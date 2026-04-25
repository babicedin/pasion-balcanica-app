"use client";

import { ImagePlus, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  photoUrls: string[];
  onPhotoUrlsChange: (next: string[]) => void;
  youtubeUrls: string[];
  onYoutubeUrlsChange: (next: string[]) => void;
};

function normalize(list: string[]): string[] {
  return list.map((x) => x.trim()).filter(Boolean);
}

function updateAt(list: string[], idx: number, value: string): string[] {
  return list.map((item, i) => (i === idx ? value : item));
}

export function MediaLinksEditor({
  photoUrls,
  onPhotoUrlsChange,
  youtubeUrls,
  onYoutubeUrlsChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasPhotos = photoUrls.length > 0;
  const uploadHint = useMemo(
    () =>
      uploading
        ? "Uploading images..."
        : "Drop images here or click to upload",
    [uploading]
  );

  async function onUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const supabase = createSupabaseBrowserClient();
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `uploads/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
        const { error } = await supabase.storage
          .from("place-images")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) {
          throw new Error(`${file.name}: ${error.message}`);
        }
        const { data } = supabase.storage.from("place-images").getPublicUrl(path);
        if (data?.publicUrl) uploaded.push(data.publicUrl);
      }
      onPhotoUrlsChange([...photoUrls, ...uploaded]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    onPhotoUrlsChange(photoUrls.filter((_, i) => i !== index));
  }

  function openFilePicker() {
    const input = fileInputRef.current;
    if (!input) return;
    // Allows selecting the same file again and still triggering onChange.
    input.value = "";
    input.click();
  }

  return (
    <div className="card p-6 md:p-7 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-brand-ink">Media</h3>
        <p className="text-xs text-muted mt-1">
          Upload photos and add YouTube links. Photos are shown as a live gallery.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="label">Photos</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary py-1.5 text-xs"
              onClick={openFilePicker}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={12} />
                  Upload images
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void onUploadFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
          </div>
        </div>

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
            "w-full rounded-2xl border border-dashed px-4 py-8 text-center transition-colors",
            dragActive
              ? "border-brand-purple bg-brand-purple/5"
              : "border-line bg-surface-muted/40 hover:bg-surface-muted"
          )}
          disabled={uploading}
        >
          <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-white border border-line grid place-items-center text-brand-purple">
            <ImagePlus size={18} />
          </div>
          <p className="text-sm font-medium text-brand-ink">{uploadHint}</p>
          <p className="text-xs text-neutral-500 mt-1">
            PNG, JPG, WEBP, AVIF up to 10MB each
          </p>
        </button>
        <p className="text-[11px] text-neutral-500">
          If upload fails, check file type/size (for example HEIC is often blocked by Storage policies).
        </p>

        {uploadError && (
          <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
            {uploadError}
          </div>
        )}

        {!hasPhotos ? (
          <p className="text-xs text-neutral-500">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photoUrls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="group relative rounded-xl overflow-hidden border border-line bg-surface-muted aspect-[4/3]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url("${url}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 hover:bg-white text-neutral-700 grid place-items-center shadow-soft"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <UrlList
        label="YouTube videos"
        placeholder="https://www.youtube.com/watch?v=..."
        values={youtubeUrls}
        onChange={onYoutubeUrlsChange}
      />
    </div>
  );
}

function UrlList({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label">{label}</label>
        <button
          type="button"
          className="btn-secondary py-1.5 text-xs"
          onClick={() => onChange([...values, ""])}
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      {values.length === 0 ? (
        <p className="text-xs text-neutral-500">No {label.toLowerCase()} added yet.</p>
      ) : (
        <div className="space-y-2">
          {values.map((value, idx) => (
            <div key={`${label}-${idx}`} className="flex items-center gap-2">
              <input
                className="input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(updateAt(values, idx, e.target.value))}
                onBlur={() => onChange(normalize(values))}
              />
              <button
                type="button"
                className="btn-danger-ghost py-2 px-2"
                onClick={() => onChange(values.filter((_, i) => i !== idx))}
                title={`Remove ${label.toLowerCase()} link`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
