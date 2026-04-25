-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — design refresh (mobile app v2)
-- Adds kicker text, broader food categories, and a one-row
-- site_settings table for guide bio + social/CTA links.
-- ─────────────────────────────────────────────────────────────

-- ── Kicker text (short subtitle like "Historic · Stari Grad") ──
alter table public.places_to_visit
  add column if not exists kicker_es text not null default '',
  add column if not exists kicker_en text not null default '';

alter table public.food_spots
  add column if not exists kicker_es text not null default '',
  add column if not exists kicker_en text not null default '';

-- ── Phone on a food spot location (for the "Call" CTA) ────────
alter table public.food_spot_locations
  add column if not exists phone text;

-- ── Expand food categories to match the new design taxonomy ───
-- Postgres cannot ADD VALUE inside a txn block in older versions,
-- but modern (>= 12) handles it fine when run as separate statements.
alter type public.food_category add value if not exists 'cevapi';
alter type public.food_category add value if not exists 'burek';
alter type public.food_category add value if not exists 'coffee';
alter type public.food_category add value if not exists 'sweets';
alter type public.food_category add value if not exists 'traditional';
alter type public.food_category add value if not exists 'rakija_bar';

-- ── Site-wide settings (single row) ───────────────────────────
create table if not exists public.site_settings (
  id                     uuid primary key default uuid_generate_v4(),
  guide_name             text not null default 'Valentina',
  guide_tagline_es       text not null default 'Guía de caminata libre, Sarajevo',
  guide_tagline_en       text not null default 'Free walking tour guide, Sarajevo',
  guide_bio_es           text not null default '',
  guide_bio_en           text not null default '',
  guide_avatar_path      text,
  stat_walkers           text not null default '0',
  stat_rating            text not null default '5.0',
  stat_years             text not null default '1',
  google_review_url      text not null default '',
  booking_url            text not null default '',
  instagram_url          text not null default '',
  whatsapp_url           text not null default '',
  share_url              text not null default '',
  updated_at             timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- RLS — public read, admin write
alter table public.site_settings enable row level security;

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read" on public.site_settings
  for select using (true);

drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Seed the one row if missing (with initial Valentina copy from design)
insert into public.site_settings (
  guide_bio_es,
  guide_bio_en,
  stat_walkers,
  stat_rating,
  stat_years
)
select
  'Hola, soy Valentina. Caminar por Sarajevo es entrar en una conversación entre imperios, guerras y cafés al atardecer. Te llevaré a los lugares que yo elegiría para una amiga — sin prisas, con historias reales.',
  'Hi, I''m Valentina. Walking Sarajevo is stepping into a conversation between empires, wars, and sunset coffees. I''ll take you where I''d take a friend — unhurried, with real stories.',
  '1,240+',
  '4.9',
  '6 yr'
where not exists (select 1 from public.site_settings);
