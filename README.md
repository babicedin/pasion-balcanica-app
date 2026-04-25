# Pasion Balcanica

Digital companion for Pasion Balcanica walking tours in Sarajevo — a backoffice for the tour guide and a mobile app for tourists.

## Monorepo layout

```
PASION BALCANICA APP/
├─ backoffice/       Next.js 14 admin panel (admin.pasionbalcanica.com)
├─ mobile/           Flutter app (Android first, iOS later)
├─ supabase/         SQL migrations + seed data
├─ docs/             Notes, decisions, roadmap
├─ logo.svg          Brand logo
└─ .env.example      Template for environment variables
```

## First-time setup checklist

1. **Supabase**
   - Migrations applied from `supabase/migrations/` (see `supabase/README.md`)
   - Seed data loaded from `supabase/seed/seed.sql`
   - Admin user created in Supabase Auth and `is_admin` flipped to `true`

2. **Backoffice**
   ```bash
   cd backoffice
   npm install
   npm run dev
   ```
   Open http://localhost:3000 and sign in.

3. **Mobile**
   ```bash
   cd mobile
   flutter create . --org com.pasionbalcanica --project-name pasion_balcanica --platforms=android
   flutter pub get
   flutter gen-l10n
   flutter run
   ```

## Environment variables

Copy `.env.example` → `.env.local` at each project where needed. The dev `.env.local` files are already created for you (gitignored).

- `backoffice/.env.local` — Next.js needs `NEXT_PUBLIC_*` and `SUPABASE_SECRET_KEY`
- `mobile/.env` — Flutter loads these at runtime via `flutter_dotenv`

## Brand palette (from logo)

| Color    | Hex       | Role                                    |
|----------|-----------|-----------------------------------------|
| Purple   | `#512e88` | Primary text + UI                       |
| Navy     | `#2f326c` | Gradient start                          |
| Plum     | `#5e2b53` | Gradient mid                            |
| Wine     | `#822640` | Gradient mid                            |
| Crimson  | `#9c2332` | Gradient mid                            |
| Red      | `#b22027` | Accent / gradient end                   |
| Cream    | `#faf7f2` | App background                          |

Used consistently in Tailwind config (backoffice) and `BrandColors` (mobile).

## Security

- `service_role` / `sb_secret_*` keys live only in local `.env.local` files (gitignored).
- The mobile app uses only the `sb_publishable_*` key.
- Row-Level Security is enforced on every table. Anonymous users can only read published content.

If a secret key has been shared anywhere unintentionally, rotate it in **Supabase dashboard → Settings → API → Rotate keys**, then update the `.env.local` files.

## Roadmap

**Phase 1 (now):** Scaffolding — schemas, auth, dashboard shell, mobile tabs. ✅

**Phase 2:** Backoffice CRUD forms — create/edit places, food, numbers. Image upload. Map picker.

**Phase 3:** Mobile polish — detail screens, map views, offline cache, language toggle.

**Phase 4:** Ship — Play Store listing, real domain, tourist feedback.

**Phase 5:** iOS — Flutter makes this mostly configuration + App Store submission.
