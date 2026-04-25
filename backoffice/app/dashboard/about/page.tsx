import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AboutEditor, type AboutRow } from "@/components/about-editor";

const EMPTY_ABOUT: AboutRow = {
  id: 1,
  guide_name: "Valentina",
  guide_tagline_en: "Free walking tour guide, Sarajevo",
  guide_tagline_es: "Guía de caminata libre, Sarajevo",
  body_en: "",
  body_es: "",
  image_url: null,
  stat_walkers: "",
  stat_rating: "",
  stat_years: "",
  google_review_url: null,
  booking_url: null,
  instagram_url: null,
  whatsapp_url: null,
  share_url: null,
};

export default async function AboutPage() {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("about_section")
    .select(
      [
        "id",
        "guide_name",
        "guide_tagline_en",
        "guide_tagline_es",
        "body_en",
        "body_es",
        "image_url",
        "stat_walkers",
        "stat_rating",
        "stat_years",
        "google_review_url",
        "booking_url",
        "instagram_url",
        "whatsapp_url",
        "share_url",
      ].join(", ")
    )
    .eq("id", 1)
    .maybeSingle();

  const initial = (data as AboutRow | null) ?? EMPTY_ABOUT;

  return <AboutEditor initial={initial} />;
}
