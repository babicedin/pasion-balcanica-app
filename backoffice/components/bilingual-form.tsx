"use client";

import { Copy, Languages } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type Lang = "en" | "es";

export type BilingualValue = { en: string; es: string };
export type BilingualValues = Record<string, BilingualValue>;

type BilingualContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  values: BilingualValues;
  setField: (key: string, lang: Lang, value: string) => void;
  copyEnToEs: () => void;
};

const BilingualContext = createContext<BilingualContextValue | null>(null);

export function useBilingual(): BilingualContextValue {
  const ctx = useContext(BilingualContext);
  if (!ctx) {
    throw new Error("useBilingual must be used inside <BilingualProvider>");
  }
  return ctx;
}

/**
 * Wrap a form with this provider to enable an EN/ES language switcher and
 * paired inputs that read/write the right side of the tuple automatically.
 *
 * Use `useBilingual()` inside the form body to read the current values when
 * submitting, and pass `initialValues` when editing an existing record.
 */
export function BilingualProvider({
  initialValues,
  defaultLang = "en",
  children,
}: {
  initialValues: BilingualValues;
  defaultLang?: Lang;
  children: ReactNode;
}) {
  const [values, setValues] = useState<BilingualValues>(initialValues);
  const [lang, setLang] = useState<Lang>(defaultLang);

  const setField = useCallback((key: string, l: Lang, value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { en: "", es: "" }), [l]: value },
    }));
  }, []);

  const copyEnToEs = useCallback(() => {
    setValues((prev) => {
      const next: BilingualValues = {};
      for (const [k, v] of Object.entries(prev)) {
        next[k] = { en: v.en, es: v.en };
      }
      return next;
    });
  }, []);

  const value = useMemo<BilingualContextValue>(
    () => ({ lang, setLang, values, setField, copyEnToEs }),
    [lang, values, setField, copyEnToEs]
  );

  return (
    <BilingualContext.Provider value={value}>
      {children}
    </BilingualContext.Provider>
  );
}

/**
 * Language switcher with an optional "Copy EN → ES" button.
 * Place it at the top of the form, above the bilingual fields.
 */
export function LanguageTabs({
  hint = "Fill in English first, then switch to Spanish. Use Copy EN → ES to seed the Spanish fields with the English text.",
}: {
  hint?: string;
}) {
  const { lang, setLang, copyEnToEs } = useBilingual();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted border border-line p-1">
        <div className="flex items-center gap-1">
          <div className="px-2 text-neutral-500">
            <Languages size={15} strokeWidth={1.75} />
          </div>
          <TabButton active={lang === "en"} onClick={() => setLang("en")}>
            English
          </TabButton>
          <TabButton active={lang === "es"} onClick={() => setLang("es")}>
            Español
          </TabButton>
        </div>
        <button
          type="button"
          onClick={copyEnToEs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-brand-ink hover:bg-white transition"
          title="Overwrite Spanish fields with the English text so you can translate"
        >
          <Copy size={13} strokeWidth={1.75} />
          Copy EN → ES
        </button>
      </div>
      {hint && <p className="text-xs text-neutral-500 px-1">{hint}</p>}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-white text-brand-ink shadow-soft"
          : "text-neutral-500 hover:text-brand-ink"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

type FieldCommonProps = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
};

export function BilingualInput({
  name,
  label,
  required,
  placeholder,
}: FieldCommonProps) {
  const { lang, values, setField } = useBilingual();
  const value = values[name]?.[lang] ?? "";
  const otherLang: Lang = lang === "en" ? "es" : "en";
  const otherValue = values[name]?.[otherLang] ?? "";

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label flex items-center gap-1.5" htmlFor={`${name}-${lang}`}>
          <span>{label}</span>
          <LangChip lang={lang} />
          {required && <span className="text-brand-red">*</span>}
        </label>
        {otherValue && (
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">
            {otherLang === "es" ? "ES set" : "EN set"}
          </span>
        )}
      </div>
      <input
        id={`${name}-${lang}`}
        className="input"
        required={required && lang === "en"}
        value={value}
        onChange={(e) => setField(name, lang, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function BilingualTextarea({
  name,
  label,
  required,
  placeholder,
  rows = 4,
}: FieldCommonProps & { rows?: number }) {
  const { lang, values, setField } = useBilingual();
  const value = values[name]?.[lang] ?? "";
  const otherLang: Lang = lang === "en" ? "es" : "en";
  const otherValue = values[name]?.[otherLang] ?? "";

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label flex items-center gap-1.5" htmlFor={`${name}-${lang}`}>
          <span>{label}</span>
          <LangChip lang={lang} />
          {required && <span className="text-brand-red">*</span>}
        </label>
        {otherValue && (
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">
            {otherLang === "es" ? "ES set" : "EN set"}
          </span>
        )}
      </div>
      <textarea
        id={`${name}-${lang}`}
        className="input min-h-28"
        required={required && lang === "en"}
        value={value}
        onChange={(e) => setField(name, lang, e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function LangChip({ lang }: { lang: Lang }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider",
        lang === "en"
          ? "bg-brand-purple/10 text-brand-purple"
          : "bg-brand-red/10 text-brand-red"
      )}
    >
      {lang}
    </span>
  );
}

/** Helper to build an initial values object from a record returned by Supabase. */
export function makeBilingualInitial(
  fields: Record<string, { en: string | null | undefined; es: string | null | undefined }>
): BilingualValues {
  const out: BilingualValues = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = { en: v.en ?? "", es: v.es ?? "" };
  }
  return out;
}
