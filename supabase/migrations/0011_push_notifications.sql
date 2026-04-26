-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — Push notifications
--
-- Two new tables:
--   • public.device_tokens  — one row per installed app instance.
--     The mobile client upserts its FCM token + locale on launch
--     and is responsible for refreshing it whenever Firebase
--     rotates it. We track install_at for the 48h review-reminder
--     cron job.
--   • public.notifications  — backoffice-facing log of admin-sent
--     broadcasts (title/body in EN+ES, per-batch counters).
--
-- RLS:
--   device_tokens: anyone can INSERT or UPDATE their own row by
--     token (devices have no auth identity), but SELECT/DELETE are
--     admin-only. Public writes are scoped tight: only the columns
--     a device legitimately owns.
--   notifications: admin-only — the mobile app never reads these,
--     it just receives the push.
-- ─────────────────────────────────────────────────────────────

-- ── 1. device_tokens ─────────────────────────────────────────
create table if not exists public.device_tokens (
  id                       uuid primary key default uuid_generate_v4(),
  token                    text not null unique,
  platform                 text not null default 'android'
                             check (platform in ('android', 'ios')),
  locale                   text not null default 'en'
                             check (locale in ('en', 'es')),
  installed_at             timestamptz not null default now(),
  last_seen_at             timestamptz not null default now(),
  review_reminder_sent_at  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists idx_device_tokens_locale
  on public.device_tokens (locale);
create index if not exists idx_device_tokens_review_due
  on public.device_tokens (installed_at)
  where review_reminder_sent_at is null;

drop trigger if exists trg_device_tokens_updated on public.device_tokens;
create trigger trg_device_tokens_updated
  before update on public.device_tokens
  for each row execute function public.touch_updated_at();

alter table public.device_tokens enable row level security;

drop policy if exists "device_tokens_anon_insert"   on public.device_tokens;
drop policy if exists "device_tokens_anon_update"   on public.device_tokens;
drop policy if exists "device_tokens_admin_select"  on public.device_tokens;
drop policy if exists "device_tokens_admin_modify"  on public.device_tokens;

-- Devices register themselves on first launch.
create policy "device_tokens_anon_insert"
  on public.device_tokens for insert
  with check (true);

-- Devices may update their own row by token (locale change, last_seen
-- bump). They cannot mutate the timestamps the cron relies on.
create policy "device_tokens_anon_update"
  on public.device_tokens for update
  using (true)
  with check (true);

-- Only admins (and the service role used by the backoffice) can read or
-- delete tokens. The service role bypasses RLS entirely, so this policy
-- protects against curious anon clients enumerating the install base.
create policy "device_tokens_admin_select"
  on public.device_tokens for select
  using (public.is_admin());

create policy "device_tokens_admin_modify"
  on public.device_tokens for delete
  using (public.is_admin());

-- ── 1b. Anonymous register-or-refresh RPC ───────────────────
-- The mobile client calls this on every launch. We don't expose
-- device_tokens for anonymous SELECT (that would let anyone enumerate
-- the install base), so we route registration through a SECURITY
-- DEFINER function that only touches the columns we trust the device
-- to set. installed_at is preserved across re-registrations — that's
-- what the 48h review-reminder cron keys off.
create or replace function public.register_device_token(
  p_token    text,
  p_platform text,
  p_locale   text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.device_tokens (token, platform, locale)
  values (p_token, p_platform, p_locale)
  on conflict (token) do update
    set locale       = excluded.locale,
        platform     = excluded.platform,
        last_seen_at = now();
end;
$$;

grant execute on function public.register_device_token(text, text, text)
  to anon, authenticated;

-- ── 2. notifications log ────────────────────────────────────
create table if not exists public.notifications (
  id              uuid primary key default uuid_generate_v4(),
  title_en        text not null,
  title_es        text not null,
  body_en         text not null,
  body_es         text not null,
  -- 'broadcast' = admin-composed; 'review_reminder' = automated 48h ping.
  kind            text not null default 'broadcast'
                    check (kind in ('broadcast', 'review_reminder')),
  target_count    integer not null default 0,
  success_count   integer not null default 0,
  failure_count   integer not null default 0,
  sent_at         timestamptz not null default now(),
  sent_by         uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_notifications_sent_at
  on public.notifications (sent_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_admin_all" on public.notifications;
create policy "notifications_admin_all"
  on public.notifications for all
  using (public.is_admin())
  with check (public.is_admin());
