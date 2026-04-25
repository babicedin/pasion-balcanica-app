# Pasion Balcanica — Backoffice

Next.js 14 admin panel for managing app content (places, food, important numbers).

## Quick start

```bash
cd backoffice
npm install
npm run dev
```

Then open http://localhost:3000 — you'll be redirected to `/login`.

## Environment

The file `.env.local` must contain:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...      # server-side only
GOOGLE_REVIEWS_SOURCE_URL=...
# or set GOOGLE_REVIEWS_PLACE_ID directly if preferred
GOOGLE_REVIEWS_PLACE_ID=...
GOOGLE_REVIEWS_TARGET=50
GOOGLE_REVIEWS_HL=en
GOOGLE_REVIEWS_GL=ba
REVIEWS_SYNC_SECRET=...      # required for external cron jobs
```

Already populated for local dev.

## Google review sync

- Manual trigger: open `/dashboard/reviews` and click **Sync now**.
- Endpoint: `POST /api/reviews/sync`
  - Auth via logged-in admin session (backoffice button), or
  - Auth via `Authorization: Bearer <REVIEWS_SYNC_SECRET>` (external scheduler).
- Imported rows are upserted into `public.reviews` keyed by `external_review_id`.
- Sync run logs are stored in `public.review_sync_runs`.

### Scheduler example

Use any cron provider (GitHub Actions, cron-job.org, EasyCron, etc.) to call:

```bash
curl -X POST https://your-domain.com/api/reviews/sync \
  -H "Authorization: Bearer $REVIEWS_SYNC_SECRET"
```

Run daily (for example, every 24h) and keep the secret server-side only.

## First-time admin setup

1. Run the Supabase migrations (see `../supabase/README.md`).
2. In Supabase dashboard → **Authentication** → **Users** → **Add user**, create an account with email `info@pasionbalcanica.com`.
3. In **SQL editor** run:
   ```sql
   update public.profiles set is_admin = true where email = 'info@pasionbalcanica.com';
   ```
4. Log in at `/login`.

## Structure

```
app/
├─ layout.tsx              Root layout
├─ page.tsx                Home → redirects to /login or /dashboard
├─ login/page.tsx          Admin sign-in
└─ dashboard/
   ├─ layout.tsx           Protected shell with sidebar
   ├─ page.tsx             Overview with counts
   ├─ places/page.tsx      Places CRUD (list view)
   ├─ food/page.tsx        Food spots CRUD (list view)
   └─ numbers/page.tsx     Important numbers CRUD (list view)
lib/
├─ utils.ts
└─ supabase/
   ├─ client.ts            Browser Supabase client
   ├─ server.ts            Server Components client
   └─ middleware.ts        Session refresh + route guarding
middleware.ts              Wires supabase/middleware to Next.js
```

## Next steps (Phase 2)

- Create/edit forms with bilingual fields for each content type
- Image upload to `place-images` bucket with drag-and-drop + auto-resize
- Leaflet map picker for latitude/longitude
- Reordering via drag-and-drop
- Publish/unpublish toggle
