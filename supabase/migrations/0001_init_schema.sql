-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — initial schema
-- Author: Edin (byteroute.dev)
-- Tables: profiles, places_to_visit, place_images,
--         food_spots, food_spot_locations, important_numbers
-- ─────────────────────────────────────────────────────────────

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Profiles (admin flag) ────────────────────────────────────
-- One row per auth.user. is_admin gates backoffice access.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used in RLS policies throughout this app.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

-- ── Places to visit ──────────────────────────────────────────
create table if not exists public.places_to_visit (
  id              uuid primary key default uuid_generate_v4(),
  title_es        text not null,
  title_en        text not null,
  description_es  text not null default '',
  description_en  text not null default '',
  latitude        double precision,
  longitude       double precision,
  address         text,
  display_order   integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_places_order on public.places_to_visit (display_order);
create index if not exists idx_places_published on public.places_to_visit (is_published);

-- ── Images for places ────────────────────────────────────────
create table if not exists public.place_images (
  id             uuid primary key default uuid_generate_v4(),
  place_id       uuid not null references public.places_to_visit(id) on delete cascade,
  storage_path   text not null,
  alt_text       text default '',
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists idx_place_images_place on public.place_images (place_id, display_order);

-- ── Food spots ───────────────────────────────────────────────
create type public.food_category as enum ('restaurant', 'cafe', 'bakery', 'market', 'street_food', 'bar');

create table if not exists public.food_spots (
  id              uuid primary key default uuid_generate_v4(),
  title_es        text not null,
  title_en        text not null,
  description_es  text not null default '',
  description_en  text not null default '',
  category        public.food_category not null default 'restaurant',
  display_order   integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_food_spots_order on public.food_spots (display_order);

-- ── Food spot locations (a food "spot" can have multiple physical locations) ─
create table if not exists public.food_spot_locations (
  id             uuid primary key default uuid_generate_v4(),
  food_spot_id   uuid not null references public.food_spots(id) on delete cascade,
  name           text,
  address        text,
  latitude       double precision,
  longitude      double precision,
  notes_es       text default '',
  notes_en       text default '',
  display_order  integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists idx_food_locations_spot on public.food_spot_locations (food_spot_id, display_order);

-- ── Important numbers ────────────────────────────────────────
create type public.number_category as enum ('emergency', 'transport', 'tourist_info', 'medical', 'embassy', 'other');

create table if not exists public.important_numbers (
  id              uuid primary key default uuid_generate_v4(),
  label_es        text not null,
  label_en        text not null,
  phone_number    text not null,
  category        public.number_category not null default 'other',
  icon            text default 'phone',
  description_es  text default '',
  description_en  text default '',
  display_order   integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_numbers_category on public.important_numbers (category, display_order);

-- ── updated_at trigger helper ────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_places_updated on public.places_to_visit;
create trigger trg_places_updated
  before update on public.places_to_visit
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_food_updated on public.food_spots;
create trigger trg_food_updated
  before update on public.food_spots
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_numbers_updated on public.important_numbers;
create trigger trg_numbers_updated
  before update on public.important_numbers
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.touch_updated_at();
