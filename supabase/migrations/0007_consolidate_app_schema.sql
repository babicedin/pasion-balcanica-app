-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — consolidate schema with what the app + backoffice actually use.
--
-- Goals:
--   • Merge public.site_settings into public.about_section so guide
--     bio / tagline / stats / social links live in one place. The mobile
--     app used to read site_settings (which had no backoffice editor);
--     now the existing About editor is the single source of truth.
--   • Give public.food_spots a phone column so the "Call" CTA on the
--     food-detail screen can be filled in without touching
--     food_spot_locations.
--   • Seed the food_categories rows the design refresh (0004) added
--     to the old enum but never added to the new table.
--
-- Safe to re-run: uses IF [NOT] EXISTS, ON CONFLICT, and guards the
-- site_settings drop behind a to_regclass check.
-- ─────────────────────────────────────────────────────────────

-- 1. Expand about_section with the fields the app's About/Review screens need.
alter table public.about_section
  add column if not exists guide_name       text not null default 'Valentina',
  add column if not exists guide_tagline_en text not null default 'Free walking tour guide, Sarajevo',
  add column if not exists guide_tagline_es text not null default 'Guía de caminata libre, Sarajevo',
  add column if not exists stat_walkers     text not null default '',
  add column if not exists stat_rating      text not null default '',
  add column if not exists stat_years       text not null default '',
  add column if not exists booking_url      text,
  add column if not exists instagram_url    text,
  add column if not exists whatsapp_url     text,
  add column if not exists share_url        text;

-- 2. If site_settings still exists, copy its row into about_section (id = 1)
--    and then drop the table. Only non-default values overwrite about_section,
--    so an admin who already edited About keeps their work.
do $$
declare
  s record;
begin
  if to_regclass('public.site_settings') is null then
    return;
  end if;

  select * into s from public.site_settings limit 1;
  if not found then
    drop table public.site_settings;
    return;
  end if;

  update public.about_section a set
    guide_name       = case when a.guide_name = 'Valentina' and s.guide_name is not null and s.guide_name <> '' then s.guide_name else a.guide_name end,
    guide_tagline_en = case when a.guide_tagline_en = 'Free walking tour guide, Sarajevo' and coalesce(s.guide_tagline_en,'') <> '' then s.guide_tagline_en else a.guide_tagline_en end,
    guide_tagline_es = case when a.guide_tagline_es = 'Guía de caminata libre, Sarajevo' and coalesce(s.guide_tagline_es,'') <> '' then s.guide_tagline_es else a.guide_tagline_es end,
    body_en          = case when a.body_en = '' then coalesce(s.guide_bio_en, '') else a.body_en end,
    body_es          = case when a.body_es = '' then coalesce(s.guide_bio_es, '') else a.body_es end,
    stat_walkers     = case when a.stat_walkers = '' then coalesce(s.stat_walkers, '') else a.stat_walkers end,
    stat_rating      = case when a.stat_rating  = '' then coalesce(s.stat_rating,  '') else a.stat_rating  end,
    stat_years       = case when a.stat_years   = '' then coalesce(s.stat_years,   '') else a.stat_years   end,
    booking_url      = coalesce(a.booking_url,   nullif(s.booking_url,   '')),
    instagram_url    = coalesce(a.instagram_url, nullif(s.instagram_url, '')),
    whatsapp_url     = coalesce(a.whatsapp_url,  nullif(s.whatsapp_url,  '')),
    share_url        = coalesce(a.share_url,     nullif(s.share_url,     '')),
    google_review_url = coalesce(a.google_review_url, nullif(s.google_review_url, ''))
  where a.id = 1;

  drop table public.site_settings;
end $$;

-- 3. Seed a reasonable default About row if it somehow ended up blank
--    (new databases where about_section was created empty).
update public.about_section
set
  body_en = case when body_en = '' then
    'Hi, I''m Valentina. Walking Sarajevo is stepping into a conversation between empires, wars, and sunset coffees. I''ll take you where I''d take a friend — unhurried, with real stories.'
    else body_en end,
  body_es = case when body_es = '' then
    'Hola, soy Valentina. Caminar por Sarajevo es entrar en una conversación entre imperios, guerras y cafés al atardecer. Te llevaré a los lugares que yo elegiría para una amiga — sin prisas, con historias reales.'
    else body_es end,
  stat_walkers = case when stat_walkers = '' then '1,240+' else stat_walkers end,
  stat_rating  = case when stat_rating  = '' then '4.9'    else stat_rating  end,
  stat_years   = case when stat_years   = '' then '6 yr'   else stat_years   end
where id = 1;

-- 4. Phone on food_spots (single-location "Call" CTA).
alter table public.food_spots
  add column if not exists phone text;

-- 5. Seed the food categories the design refresh added to the old enum
--    but never added to the dynamic table. idempotent.
insert into public.food_categories (slug, label_es, label_en, icon, display_order)
values
  ('cevapi',      'Ćevapi',           'Ćevapi',       'utensils',    7),
  ('burek',       'Burek',            'Burek',        'croissant',   8),
  ('coffee',      'Café especialidad','Specialty coffee', 'coffee',  9),
  ('sweets',      'Dulces',           'Sweets',       'candy',       10),
  ('traditional', 'Tradicional',      'Traditional',  'utensils',    11),
  ('rakija_bar',  'Rakija & Bar',     'Rakija & Bar', 'wine-glass',  12)
on conflict (slug) do nothing;
