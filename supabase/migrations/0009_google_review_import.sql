-- Google reviews import support (scraper-based sync).
-- Safe to re-run.

alter table public.reviews
  add column if not exists source text not null default 'manual',
  add column if not exists external_review_id text,
  add column if not exists source_review_url text,
  add column if not exists author_avatar_url text,
  add column if not exists review_created_at timestamptz,
  add column if not exists review_updated_at timestamptz,
  add column if not exists fetched_at timestamptz not null default now(),
  add column if not exists raw_payload jsonb;

alter table public.reviews
  drop constraint if exists reviews_source_check;

alter table public.reviews
  add constraint reviews_source_check
  check (source in ('manual', 'google_scraper'));

create unique index if not exists reviews_external_review_id_uniq
  on public.reviews(external_review_id)
  where external_review_id is not null;

create table if not exists public.review_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'google_scraper',
  status text not null check (status in ('running', 'success', 'failed')),
  reviews_fetched integer not null default 0,
  reviews_upserted integer not null default 0,
  error_message text,
  metadata jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.review_sync_runs enable row level security;

drop policy if exists "review_sync_runs_admin_read" on public.review_sync_runs;
drop policy if exists "review_sync_runs_admin_insert" on public.review_sync_runs;
drop policy if exists "review_sync_runs_admin_update" on public.review_sync_runs;

create policy "review_sync_runs_admin_read"
  on public.review_sync_runs for select
  using (public.is_admin());

create policy "review_sync_runs_admin_insert"
  on public.review_sync_runs for insert
  with check (public.is_admin());

create policy "review_sync_runs_admin_update"
  on public.review_sync_runs for update
  using (public.is_admin())
  with check (public.is_admin());
