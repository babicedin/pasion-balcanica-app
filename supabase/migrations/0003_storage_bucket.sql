-- ─────────────────────────────────────────────────────────────
-- Pasion Balcanica — Storage bucket for place/food images
-- Bucket: place-images (public read, admin write)
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'place-images',
  'place-images',
  true,
  10485760, -- 10 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read on the bucket's objects.
drop policy if exists "place_images_public_select" on storage.objects;
create policy "place_images_public_select"
  on storage.objects for select
  to public
  using (bucket_id = 'place-images');

-- Admin can write/update/delete.
drop policy if exists "place_images_admin_insert" on storage.objects;
create policy "place_images_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'place-images' and public.is_admin());

drop policy if exists "place_images_admin_update" on storage.objects;
create policy "place_images_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'place-images' and public.is_admin())
  with check (bucket_id = 'place-images' and public.is_admin());

drop policy if exists "place_images_admin_delete" on storage.objects;
create policy "place_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'place-images' and public.is_admin());
