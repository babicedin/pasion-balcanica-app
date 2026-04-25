# Pasion Balcanica — Mobile

Flutter app for Android (iOS later, same codebase).

## First-time setup

Flutter needs platform scaffolding that can't be in version control. From the `mobile/` folder:

```bash
# Generates android/ and ios/ folders into this project
flutter create . --org com.pasionbalcanica --project-name pasion_balcanica --platforms=android

# Copy the logo into assets
mkdir -p assets
cp ../logo.svg assets/logo.svg

# Install deps
flutter pub get

# Generate localization files from .arb (creates lib/l10n/app_localizations.dart)
flutter gen-l10n
```

## Run on Android emulator

```bash
flutter devices          # make sure an emulator is listed
flutter run
```

## Environment

The file `.env` at the project root is loaded at startup via `flutter_dotenv`:

```
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
```

Already populated for local dev.

## Structure

```
lib/
├─ main.dart                   App entry, MaterialApp, locale
├─ theme.dart                  BrandColors + buildAppTheme
├─ supabase_client.dart        Supabase init
├─ models.dart                 Place, FoodSpot, ImportantNumber
├─ providers.dart              Riverpod state + data providers
├─ widgets/
│  └─ glass.dart               GlassCard, BrandBackdrop
├─ screens/
│  ├─ home_shell.dart          Bottom nav + language toggle
│  ├─ places_screen.dart
│  ├─ food_screen.dart
│  └─ numbers_screen.dart
└─ l10n/
   ├─ app_es.arb
   └─ app_en.arb
```

## Next steps (Phase 3 cont'd)

- Detail screens for Places and Food
- Offline cache using `sqflite` or `isar`
- Embedded map on detail pages
- Share-as-PDF from any tab
- Play Store icon + splash (flutter_launcher_icons + flutter_native_splash)
