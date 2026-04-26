# Pasion Balcanica — Supabase

Database schema, RLS policies and seed data.

## Applying migrations

Two options:

### Option A — Supabase dashboard (easiest first time)

1. Open the project's **SQL editor** in the Supabase dashboard.
2. Run each file in order, top to bottom:
   - `migrations/0001_init_schema.sql`
   - `migrations/0002_rls_policies.sql`
   - `migrations/0003_storage_bucket.sql`
   - `migrations/0004_design_refresh.sql`
   - `migrations/0004_dynamic_categories.sql`
   - `migrations/0005_media_links.sql`
   - `migrations/0006_about_section.sql`
   - `migrations/0007_consolidate_app_schema.sql`
   - `migrations/0008_reviews_and_share.sql`
   - `migrations/0009_google_review_import.sql`
   - `migrations/0010_shopping.sql`
   - `migrations/0011_home_curation_flags.sql`
   - `migrations/0011_push_notifications.sql`
   - `migrations/0012_harden_device_tokens_rls.sql`
   - `seed/seed.sql`

> **Note on the two `0004_*` files.** Both migrations are safe to re-run
> in alphabetical order: `design_refresh` runs first and expands the old
> `food_category` enum, then `dynamic_categories` converts that enum into
> the `food_categories` table. Migration 0007 later consolidates
> `site_settings` into `about_section` and adds `food_spots.phone`.

> **Note on `0011_*` files.** There are two migrations with the `0011_`
> prefix (`home_curation_flags` and `push_notifications`). Run both before
> `0012_harden_device_tokens_rls.sql`.

> If the backoffice keeps showing `Could not find the table '…' in the schema cache`
> after a migration, run `notify pgrst, 'reload schema';` in the SQL editor or
> restart the API server from **Settings → API**.

### Option B — Supabase CLI (recommended for repeatable setups)

```bash
# One-time
npm install -g supabase

# From the project root
supabase link --project-ref ecdpmoqlpgwfymzgzakw

# Push all migrations
supabase db push

# Run seed
supabase db execute --file supabase/seed/seed.sql
```

## First-time admin

After migrations run:

1. Supabase dashboard → **Authentication** → **Users** → **Add user**.
2. Email: `info@pasionbalcanica.com`, choose a password.
3. Supabase dashboard → **SQL editor**:
   ```sql
   update public.profiles
     set is_admin = true
     where email = 'info@pasionbalcanica.com';
   ```

The backoffice will now let that user in and let them write to all tables.

## Schema summary

| Table | Purpose |
|---|---|
| `profiles`             | One row per auth user. Holds `is_admin` flag. |
| `places_to_visit`      | Sights the tour covers. Bilingual title, kicker and description; stores `photo_urls[]` and `youtube_urls[]` directly. |
| `food_spots`           | Restaurants, cafes, markets, street food. Bilingual; carries its own location, `phone`, `photo_urls[]` and `youtube_urls[]`. |
| `important_numbers`    | Emergency, transport, tourist-info contacts. Bilingual. |
| `food_categories`      | Dynamic categories for food spots. Managed in the backoffice Categories page. |
| `number_categories`    | Dynamic categories for important numbers. Managed in the backoffice Categories page. |
| `about_section`        | Singleton row (id = 1). Source of truth for the guide's name, tagline, bio, portrait, stats and all CTA URLs (booking, Google review, Instagram, WhatsApp, share). |

### Legacy tables

`place_images` and `food_spot_locations` still exist in the database for
historical reasons but are no longer read or written by any app. Media
URLs and locations now live directly on the parent row. The tables can
be dropped in a future migration once we're sure they contain no data
you want to keep.

## RLS summary

- **Anonymous (mobile app) users** can `SELECT` any row where `is_published = true`.
- **Admin users** (profile with `is_admin = true`) can do everything.
- **Other authenticated users** can only read their own profile row.

## Resetting

To wipe everything and start over:

```sql
drop schema public cascade;
create schema public;
-- then re-run 0001 → 0003 → seed
```
