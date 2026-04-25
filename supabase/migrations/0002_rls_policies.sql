-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — Row-Level Security
-- Public read on published content. Admin-only writes.
-- ─────────────────────────────────────────────────────────────

alter table public.profiles             enable row level security;
alter table public.places_to_visit      enable row level security;
alter table public.place_images         enable row level security;
alter table public.food_spots           enable row level security;
alter table public.food_spot_locations  enable row level security;
alter table public.important_numbers    enable row level security;

-- ── Profiles ─────────────────────────────────────────────────
-- Authenticated users can read their own profile.
-- Admins can read all profiles (for future multi-admin support).
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_admin_read"  on public.profiles;
drop policy if exists "profiles_admin_write" on public.profiles;

create policy "profiles_self_read"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_admin_read"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles_admin_write"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Places to visit ──────────────────────────────────────────
drop policy if exists "places_public_read" on public.places_to_visit;
drop policy if exists "places_admin_all"   on public.places_to_visit;

create policy "places_public_read"
  on public.places_to_visit for select
  using (is_published = true or public.is_admin());

create policy "places_admin_all"
  on public.places_to_visit for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Place images ─────────────────────────────────────────────
drop policy if exists "place_images_public_read" on public.place_images;
drop policy if exists "place_images_admin_all"   on public.place_images;

create policy "place_images_public_read"
  on public.place_images for select
  using (
    exists (
      select 1 from public.places_to_visit p
      where p.id = place_images.place_id
        and (p.is_published = true or public.is_admin())
    )
  );

create policy "place_images_admin_all"
  on public.place_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Food spots ───────────────────────────────────────────────
drop policy if exists "food_public_read" on public.food_spots;
drop policy if exists "food_admin_all"   on public.food_spots;

create policy "food_public_read"
  on public.food_spots for select
  using (is_published = true or public.is_admin());

create policy "food_admin_all"
  on public.food_spots for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Food spot locations ──────────────────────────────────────
drop policy if exists "food_locations_public_read" on public.food_spot_locations;
drop policy if exists "food_locations_admin_all"   on public.food_spot_locations;

create policy "food_locations_public_read"
  on public.food_spot_locations for select
  using (
    exists (
      select 1 from public.food_spots f
      where f.id = food_spot_locations.food_spot_id
        and (f.is_published = true or public.is_admin())
    )
  );

create policy "food_locations_admin_all"
  on public.food_spot_locations for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Important numbers ────────────────────────────────────────
drop policy if exists "numbers_public_read" on public.important_numbers;
drop policy if exists "numbers_admin_all"   on public.important_numbers;

create policy "numbers_public_read"
  on public.important_numbers for select
  using (is_published = true or public.is_admin());

create policy "numbers_admin_all"
  on public.important_numbers for all
  using (public.is_admin())
  with check (public.is_admin());
