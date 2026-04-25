import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/models.dart';
import '../supabase_client.dart';

// ─── Locale (persisted) ──────────────────────────────────────────────
class LocaleController extends StateNotifier<String> {
  LocaleController() : super('es') {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString('locale');
    if (stored != null && (stored == 'es' || stored == 'en')) state = stored;
  }

  Future<void> setLocale(String code) async {
    if (state == code) return;
    state = code;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('locale', code);
  }

  Future<void> toggle() => setLocale(state == 'es' ? 'en' : 'es');
}

final localeProvider =
    StateNotifierProvider<LocaleController, String>((_) => LocaleController());

// ─── Theme mode (persisted) ──────────────────────────────────────────
class ThemeModeController extends StateNotifier<ThemeMode> {
  ThemeModeController() : super(ThemeMode.light) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString('themeMode');
    if (stored == 'dark') state = ThemeMode.dark;
    if (stored == 'light') state = ThemeMode.light;
  }

  Future<void> toggle() async {
    state = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('themeMode', state == ThemeMode.dark ? 'dark' : 'light');
  }
}

final themeModeProvider =
    StateNotifierProvider<ThemeModeController, ThemeMode>(
  (_) => ThemeModeController(),
);

// ─── Active tab index ────────────────────────────────────────────────
//
// Held at the app level so any screen (not just the shell) can request a
// tab switch — e.g. the Home shortcut tiles jumping to Places or Food.
// Indexes match the order of `PBTab.values`: home, places, food, shopping,
// numbers, review.
final activeTabIndexProvider = StateProvider<int>((_) => 0);

// ─── Data providers ──────────────────────────────────────────────────

/// Places — reads media directly from the array columns the backoffice
/// writes to (photo_urls, youtube_urls). Returns only published rows from
/// Supabase (empty list if none, or on fetch failure — check logs).
final placesProvider = FutureProvider<List<Place>>((ref) async {
  try {
    final rows = await supabase
        .from('places_to_visit')
        .select()
        .eq('is_published', true)
        .order('display_order', ascending: true);

    return (rows as List)
        .map((r) => Place.fromMap(r as Map<String, dynamic>))
        .toList();
  } catch (e, st) {
    debugPrint('placesProvider: $e\n$st');
    return const <Place>[];
  }
});

/// Food spots — flat schema: location, phone, photos and YouTube links all
/// live on food_spots itself (see migration 0007).
final foodSpotsProvider = FutureProvider<List<FoodSpot>>((ref) async {
  try {
    final rows = await supabase
        .from('food_spots')
        .select()
        .eq('is_published', true)
        .order('display_order', ascending: true);

    return (rows as List)
        .map((r) => FoodSpot.fromMap(r as Map<String, dynamic>))
        .toList();
  } catch (e, st) {
    debugPrint('foodSpotsProvider: $e\n$st');
    return const <FoodSpot>[];
  }
});

/// Shops — boutiques, markets, artisans and souvenirs. Same shape as
/// food spots; lives in `public.shops`.
final shopsProvider = FutureProvider<List<Shop>>((ref) async {
  try {
    final rows = await supabase
        .from('shops')
        .select()
        .eq('is_published', true)
        .order('display_order', ascending: true);

    return (rows as List)
        .map((r) => Shop.fromMap(r as Map<String, dynamic>))
        .toList();
  } catch (e, st) {
    debugPrint('shopsProvider: $e\n$st');
    return const <Shop>[];
  }
});

/// Shop categories — backoffice-managed list of filter chips for Shopping.
final shopCategoriesProvider =
    FutureProvider<List<CategoryInfo>>((ref) async {
  try {
    final rows = await supabase
        .from('shop_categories')
        .select()
        .eq('is_published', true)
        .order('display_order', ascending: true);

    return (rows as List)
        .map((r) => CategoryInfo.fromMap(r as Map<String, dynamic>))
        .toList();
  } catch (e, st) {
    debugPrint('shopCategoriesProvider: $e\n$st');
    return const <CategoryInfo>[];
  }
});

/// Important numbers — straight read; icon slug comes from the backoffice
/// IconPicker and is mapped to a Material IconData at render time.
final importantNumbersProvider =
    FutureProvider<List<ImportantNumber>>((ref) async {
  try {
    final rows = await supabase
        .from('important_numbers')
        .select()
        .eq('is_published', true)
        .order('display_order', ascending: true);

    return (rows as List)
        .map((r) => ImportantNumber.fromMap(r as Map<String, dynamic>))
        .toList();
  } catch (e, st) {
    debugPrint('importantNumbersProvider: $e\n$st');
    return const <ImportantNumber>[];
  }
});

/// Food categories — the backoffice-managed list of filter chips.
final foodCategoriesProvider =
    FutureProvider<List<CategoryInfo>>((ref) async {
  try {
    final rows = await supabase
        .from('food_categories')
        .select()
        .eq('is_published', true)
        .order('display_order', ascending: true);

    return (rows as List)
        .map((r) => CategoryInfo.fromMap(r as Map<String, dynamic>))
        .toList();
  } catch (e, st) {
    debugPrint('foodCategoriesProvider: $e\n$st');
    return const <CategoryInfo>[];
  }
});

/// Number categories — labels/icons for important numbers.
final numberCategoriesProvider =
    FutureProvider<List<CategoryInfo>>((ref) async {
  try {
    final rows = await supabase
        .from('number_categories')
        .select()
        .eq('is_published', true)
        .order('display_order', ascending: true);

    return (rows as List)
        .map((r) => CategoryInfo.fromMap(r as Map<String, dynamic>))
        .toList();
  } catch (e, st) {
    debugPrint('numberCategoriesProvider: $e\n$st');
    return const <CategoryInfo>[];
  }
});

/// Review testimonials — admin-curated quotes rendered on the Review tab.
///
/// Returns only published rows, newest first by display_order then
/// created_at. The screen picks one to feature; if the table is empty we
/// simply don't render the testimonial card (see review_screen.dart).
final reviewsProvider = FutureProvider<List<Review>>((ref) async {
  try {
    final rows = await supabase
        .from('reviews')
        .select()
        .eq('is_published', true)
        .order('display_order', ascending: true)
        .order('created_at', ascending: false);

    return (rows as List)
        .map((r) => Review.fromMap(r as Map<String, dynamic>))
        .toList();
  } catch (_) {
    return const <Review>[];
  }
});

/// Guide bio + stats + social links. Reads from `about_section` (migration
/// 0007 consolidated the old `site_settings` table here). Falls back to the
/// design's Valentina copy when the row is missing/unreachable.
final siteSettingsProvider = FutureProvider<SiteSettings>((ref) async {
  try {
    final rows = await supabase
        .from('about_section')
        .select()
        .eq('id', 1)
        .limit(1) as List;
    if (rows.isEmpty) return SiteSettings.fallback;
    return SiteSettings.fromAboutRow(rows.first as Map<String, dynamic>);
  } catch (_) {
    return SiteSettings.fallback;
  }
});
