-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — About us (singleton)
--
-- Stores the "About us" content rendered in the mobile app:
--   - Bilingual body text
--   - Single image (stored as a public URL; uploaded via the
--     existing `place-images` Storage bucket)
--   - Link to the Google Reviews profile
--
-- Modeled as a single-row table via a constant primary key so
-- updates are always simple upserts keyed on id = 1.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.about_section (
  id                 integer primary key default 1,
  body_en            text not null default '',
  body_es            text not null default '',
  image_url          text,
  google_review_url  text,
  updated_at         timestamptz not null default now(),
  constraint about_section_singleton check (id = 1)
);

insert into public.about_section (id) values (1)
  on conflict (id) do nothing;

drop trigger if exists trg_about_updated on public.about_section;
create trigger trg_about_updated
  before update on public.about_section
  for each row execute function public.touch_updated_at();

-- RLS: anyone can read, only admins can write.
alter table public.about_section enable row level security;

drop policy if exists "about_public_read" on public.about_section;
drop policy if exists "about_admin_all"   on public.about_section;

create policy "about_public_read"
  on public.about_section for select
  using (true);

create policy "about_admin_all"
  on public.about_section for all
  using (public.is_admin())
  with check (public.is_admin());
