-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — testimonials + share metadata
--
-- The mobile Review screen used to render a single hardcoded quote
-- attributed to "a recent review". That was placeholder copy; we now
-- move this to a real table so the admin can paste the guide's
-- favourite Google reviews in the backoffice and have the app rotate
-- through them.
--
-- Columns mirror the shape of the `about_section` bilingual content
-- (quote_es / quote_en) so we don't need any client-side locale
-- fallback logic. `rating` is a 1..5 integer — purely decorative.
-- `source_url` lets the admin link back to the Google review for
-- provenance / auditing (not rendered in the app).
--
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  quote_es       text not null default '',
  quote_en       text not null default '',
  author         text not null default '',
  rating         integer not null default 5
                 check (rating between 1 and 5),
  source_url     text,
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists trg_reviews_updated on public.reviews;
create trigger trg_reviews_updated
  before update on public.reviews
  for each row execute function public.touch_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "reviews_public_read" on public.reviews;
drop policy if exists "reviews_admin_all"   on public.reviews;

-- Published rows are readable to everyone (mobile app uses the anon key).
create policy "reviews_public_read"
  on public.reviews for select
  using (is_published = true);

-- Anything else is admin-only.
create policy "reviews_admin_all"
  on public.reviews for all
  using (public.is_admin())
  with check (public.is_admin());
