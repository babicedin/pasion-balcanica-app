alter table if exists public.places_to_visit
  add column if not exists is_home_pick boolean not null default false,
  add column if not exists is_home_must_see boolean not null default false;

alter table if exists public.food_spots
  add column if not exists is_home_taste boolean not null default false;

create index if not exists idx_places_home_pick
  on public.places_to_visit (is_home_pick)
  where is_published = true;

create index if not exists idx_places_home_must_see
  on public.places_to_visit (is_home_must_see)
  where is_published = true;

create index if not exists idx_food_home_taste
  on public.food_spots (is_home_taste)
  where is_published = true;
