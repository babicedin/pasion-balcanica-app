-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — dynamic categories + location on food_spots
--
-- What this does:
--   1. Introduces editable category tables (food_categories,
--      number_categories) so admins can manage them from the
--      backoffice instead of them being hard-coded enums.
--   2. Converts food_spots.category and important_numbers.category
--      from Postgres enums to text columns referencing those new
--      tables, preserving existing values.
--   3. Adds lat/lng/address columns to food_spots so the backoffice
--      can pin a single location on the map.
--
-- Safe to run on an existing database: preserves current data,
-- uses IF [NOT] EXISTS and ON CONFLICT where appropriate, and
-- drops old enum types only AFTER the columns no longer depend
-- on them.
-- ─────────────────────────────────────────────────────────────

-- ── 1. Category tables ───────────────────────────────────────
create table if not exists public.food_categories (
  slug           text primary key,
  label_es       text not null,
  label_en       text not null,
  icon           text not null default 'utensils',
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.number_categories (
  slug           text primary key,
  label_es       text not null,
  label_en       text not null,
  icon           text not null default 'phone',
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_food_categories_order on public.food_categories (display_order);
create index if not exists idx_number_categories_order on public.number_categories (display_order);

-- ── 2. Seed rows matching previous enum values ───────────────
insert into public.food_categories (slug, label_es, label_en, icon, display_order)
values
  ('restaurant',  'Restaurante',       'Restaurant',   'utensils',     1),
  ('cafe',        'Café',              'Café',         'coffee',       2),
  ('bakery',      'Panadería',         'Bakery',       'croissant',    3),
  ('market',      'Mercado',           'Market',       'store',        4),
  ('street_food', 'Comida callejera',  'Street food',  'shopping-bag', 5),
  ('bar',         'Bar',               'Bar',          'beer',         6)
on conflict (slug) do nothing;

insert into public.number_categories (slug, label_es, label_en, icon, display_order)
values
  ('emergency',    'Emergencia',       'Emergency',     'alert-triangle', 1),
  ('transport',    'Transporte',       'Transport',     'bus',            2),
  ('tourist_info', 'Info turística',   'Tourist info',  'map',            3),
  ('medical',      'Médico',           'Medical',       'ambulance',      4),
  ('embassy',      'Embajada',         'Embassy',       'landmark',       5),
  ('other',        'Otro',             'Other',         'phone',          6)
on conflict (slug) do nothing;

-- ── 3. Convert enum columns to text + add FK ─────────────────
-- food_spots.category
alter table public.food_spots
  alter column category drop default;
alter table public.food_spots
  alter column category type text using category::text;
alter table public.food_spots
  alter column category set default 'restaurant';

alter table public.food_spots
  drop constraint if exists food_spots_category_fk;
alter table public.food_spots
  add constraint food_spots_category_fk
  foreign key (category)
  references public.food_categories(slug)
  on update cascade
  on delete set default;

-- important_numbers.category
alter table public.important_numbers
  alter column category drop default;
alter table public.important_numbers
  alter column category type text using category::text;
alter table public.important_numbers
  alter column category set default 'other';

alter table public.important_numbers
  drop constraint if exists important_numbers_category_fk;
alter table public.important_numbers
  add constraint important_numbers_category_fk
  foreign key (category)
  references public.number_categories(slug)
  on update cascade
  on delete set default;

-- ── 4. Drop old enum types (no longer referenced) ────────────
drop type if exists public.food_category;
drop type if exists public.number_category;

-- ── 5. Single-location columns on food_spots ─────────────────
-- Many food spots will only have one address. Additional
-- locations can still live in public.food_spot_locations if needed.
alter table public.food_spots add column if not exists latitude  double precision;
alter table public.food_spots add column if not exists longitude double precision;
alter table public.food_spots add column if not exists address   text;

-- ── 6. updated_at triggers for new tables ────────────────────
drop trigger if exists trg_food_categories_updated on public.food_categories;
create trigger trg_food_categories_updated
  before update on public.food_categories
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_number_categories_updated on public.number_categories;
create trigger trg_number_categories_updated
  before update on public.number_categories
  for each row execute function public.touch_updated_at();

-- ── 7. RLS for new tables ────────────────────────────────────
alter table public.food_categories    enable row level security;
alter table public.number_categories  enable row level security;

drop policy if exists "food_categories_public_read" on public.food_categories;
drop policy if exists "food_categories_admin_all"   on public.food_categories;

create policy "food_categories_public_read"
  on public.food_categories for select
  using (is_published = true or public.is_admin());

create policy "food_categories_admin_all"
  on public.food_categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "number_categories_public_read" on public.number_categories;
drop policy if exists "number_categories_admin_all"   on public.number_categories;

create policy "number_categories_public_read"
  on public.number_categories for select
  using (is_published = true or public.is_admin());

create policy "number_categories_admin_all"
  on public.number_categories for all
  using (public.is_admin())
  with check (public.is_admin());
