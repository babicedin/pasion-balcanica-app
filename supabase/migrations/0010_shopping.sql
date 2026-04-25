-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — Shopping module
--
-- Adds a third "thing-to-do" surface that mirrors food_spots /
-- food_categories one-for-one. Mobile picks up a 6th bottom tab,
-- the backoffice gets a new sidebar section + a Shopping tab in
-- the Categories manager.
--
--   • public.shop_categories   ← editable filter chips
--   • public.shops             ← single-page record per shop
--
-- The shape is intentionally identical to food_spots so the
-- mobile FoodSpot model + screens could be reused if we ever
-- consolidate them later.
--
-- Safe to re-run: every statement is guarded with IF [NOT] EXISTS
-- or ON CONFLICT.
-- ─────────────────────────────────────────────────────────────

-- ── 1. Categories table ──────────────────────────────────────
create table if not exists public.shop_categories (
  slug           text primary key,
  label_es       text not null,
  label_en       text not null,
  icon           text not null default 'shopping-bag',
  display_order  integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_shop_categories_order
  on public.shop_categories (display_order);

-- ── 2. Shops table ───────────────────────────────────────────
create table if not exists public.shops (
  id              uuid primary key default uuid_generate_v4(),
  title_es        text not null,
  title_en        text not null,
  kicker_es       text not null default '',
  kicker_en       text not null default '',
  description_es  text not null default '',
  description_en  text not null default '',
  category        text not null default 'souvenirs',
  address         text,
  latitude        double precision,
  longitude       double precision,
  phone           text,
  photo_urls      text[] not null default '{}',
  youtube_urls    text[] not null default '{}',
  display_order   integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_shops_order
  on public.shops (display_order);
create index if not exists idx_shops_published
  on public.shops (is_published);

-- ── 3. FK from shops.category → shop_categories.slug ─────────
alter table public.shops
  drop constraint if exists shops_category_fk;
alter table public.shops
  add constraint shops_category_fk
  foreign key (category)
  references public.shop_categories(slug)
  on update cascade
  on delete set default;

-- ── 4. Seed sensible default categories ──────────────────────
insert into public.shop_categories (slug, label_es, label_en, icon, display_order)
values
  ('souvenirs',  'Souvenirs',         'Souvenirs',         'shopping-bag', 1),
  ('boutique',   'Boutique',          'Boutique',          'shirt',        2),
  ('market',     'Mercado',           'Market',            'store',        3),
  ('jewelry',    'Joyería',           'Jewelry',           'gem',          4),
  ('artisan',    'Artesanía',         'Artisan',           'palette',      5),
  ('books',      'Librería',          'Books & music',     'book',         6),
  ('grocery',    'Tienda de barrio',  'Grocery',           'shopping-cart',7)
on conflict (slug) do nothing;

-- ── 5. updated_at triggers ───────────────────────────────────
drop trigger if exists trg_shops_updated on public.shops;
create trigger trg_shops_updated
  before update on public.shops
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_shop_categories_updated on public.shop_categories;
create trigger trg_shop_categories_updated
  before update on public.shop_categories
  for each row execute function public.touch_updated_at();

-- ── 6. RLS — public reads of published rows; admin-only writes ─
alter table public.shops             enable row level security;
alter table public.shop_categories   enable row level security;

drop policy if exists "shops_public_read" on public.shops;
drop policy if exists "shops_admin_all"   on public.shops;

create policy "shops_public_read"
  on public.shops for select
  using (is_published = true or public.is_admin());

create policy "shops_admin_all"
  on public.shops for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "shop_categories_public_read" on public.shop_categories;
drop policy if exists "shop_categories_admin_all"   on public.shop_categories;

create policy "shop_categories_public_read"
  on public.shop_categories for select
  using (is_published = true or public.is_admin());

create policy "shop_categories_admin_all"
  on public.shop_categories for all
  using (public.is_admin())
  with check (public.is_admin());
