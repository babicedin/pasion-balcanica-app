-- Editable notification templates for backoffice-driven automated sends.
create table if not exists public.notification_templates (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  title       text not null,
  body        text not null,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

drop trigger if exists trg_notification_templates_updated on public.notification_templates;
create trigger trg_notification_templates_updated
  before update on public.notification_templates
  for each row execute function public.touch_updated_at();

alter table public.notification_templates enable row level security;

drop policy if exists "notification_templates_admin_all" on public.notification_templates;
create policy "notification_templates_admin_all"
  on public.notification_templates for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.notification_templates (key, title, body)
values (
  'review_reminder_48h',
  'How was your walk?',
  '30 seconds to leave a Google review — it helps other travelers find Pasión Balcánica. ⭐'
)
on conflict (key) do nothing;
