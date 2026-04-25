-- Add media link columns for places and food spots.
-- Stores direct image URLs and YouTube links entered from backoffice forms.

alter table public.places_to_visit
  add column if not exists photo_urls text[] not null default '{}',
  add column if not exists youtube_urls text[] not null default '{}';

alter table public.food_spots
  add column if not exists photo_urls text[] not null default '{}',
  add column if not exists youtube_urls text[] not null default '{}';
