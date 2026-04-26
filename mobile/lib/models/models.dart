import 'package:flutter/foundation.dart';

/// A category row fetched from Supabase's `food_categories` or
/// `number_categories` tables. Used for filter chips + detail pills.
///
/// The `icon` is a lucide-style slug (same names the backoffice IconPicker
/// produces). The mobile app maps it to a Material IconData at render time.
@immutable
class CategoryInfo {
  final String slug;
  final String labelEs;
  final String labelEn;
  final String icon;
  final int displayOrder;

  const CategoryInfo({
    required this.slug,
    required this.labelEs,
    required this.labelEn,
    required this.icon,
    required this.displayOrder,
  });

  factory CategoryInfo.fromMap(Map<String, dynamic> m) => CategoryInfo(
        slug: (m['slug'] ?? '') as String,
        labelEs: (m['label_es'] ?? '') as String,
        labelEn: (m['label_en'] ?? '') as String,
        icon: (m['icon'] ?? 'tag') as String,
        displayOrder: (m['display_order'] ?? 0) as int,
      );

  String labelFor(String locale) => locale.startsWith('es') ? labelEs : labelEn;

  /// Fallback used when a record references a category slug that isn't in
  /// the categories table (stale FK, freshly inserted row, etc).
  static CategoryInfo unknown(String slug) => CategoryInfo(
        slug: slug,
        labelEs: slug,
        labelEn: slug,
        icon: 'tag',
        displayOrder: 0,
      );
}

@immutable
class Place {
  final String id;
  final String titleEs;
  final String titleEn;
  final String kickerEs;
  final String kickerEn;
  final String descriptionEs;
  final String descriptionEn;
  final double? latitude;
  final double? longitude;
  final String? address;
  final List<String> imageUrls;
  final List<String> youtubeUrls;
  final bool isHomePick;
  final bool isHomeMustSee;

  const Place({
    required this.id,
    required this.titleEs,
    required this.titleEn,
    required this.kickerEs,
    required this.kickerEn,
    required this.descriptionEs,
    required this.descriptionEn,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.imageUrls,
    required this.youtubeUrls,
    required this.isHomePick,
    required this.isHomeMustSee,
  });

  factory Place.fromMap(Map<String, dynamic> m) {
    final photos = _asStringList(m['photo_urls']);
    final videos = _asStringList(m['youtube_urls']);
    return Place(
      id: m['id'] as String,
      titleEs: (m['title_es'] ?? '') as String,
      titleEn: (m['title_en'] ?? '') as String,
      kickerEs: (m['kicker_es'] ?? '') as String,
      kickerEn: (m['kicker_en'] ?? '') as String,
      descriptionEs: (m['description_es'] ?? '') as String,
      descriptionEn: (m['description_en'] ?? '') as String,
      latitude: (m['latitude'] as num?)?.toDouble(),
      longitude: (m['longitude'] as num?)?.toDouble(),
      address: m['address'] as String?,
      imageUrls: photos,
      youtubeUrls: videos,
      isHomePick: (m['is_home_pick'] ?? false) as bool,
      isHomeMustSee: (m['is_home_must_see'] ?? false) as bool,
    );
  }

  String get heroImageUrl => imageUrls.isNotEmpty ? imageUrls.first : '';
  int get videoCount => youtubeUrls.length;

  String titleFor(String locale) => locale.startsWith('es') ? titleEs : titleEn;
  String kickerFor(String locale) =>
      locale.startsWith('es') ? kickerEs : kickerEn;
  String descriptionFor(String locale) =>
      locale.startsWith('es') ? descriptionEs : descriptionEn;
}

@immutable
class FoodSpot {
  final String id;
  final String titleEs;
  final String titleEn;
  final String kickerEs;
  final String kickerEn;
  final String descriptionEs;
  final String descriptionEn;
  final String categorySlug;
  final List<String> imageUrls;
  final List<String> youtubeUrls;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String? phone;
  final bool isHomeTaste;

  const FoodSpot({
    required this.id,
    required this.titleEs,
    required this.titleEn,
    required this.kickerEs,
    required this.kickerEn,
    required this.descriptionEs,
    required this.descriptionEn,
    required this.categorySlug,
    required this.imageUrls,
    required this.youtubeUrls,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.phone,
    required this.isHomeTaste,
  });

  factory FoodSpot.fromMap(Map<String, dynamic> m) => FoodSpot(
        id: m['id'] as String,
        titleEs: (m['title_es'] ?? '') as String,
        titleEn: (m['title_en'] ?? '') as String,
        kickerEs: (m['kicker_es'] ?? '') as String,
        kickerEn: (m['kicker_en'] ?? '') as String,
        descriptionEs: (m['description_es'] ?? '') as String,
        descriptionEn: (m['description_en'] ?? '') as String,
        categorySlug: (m['category'] ?? 'restaurant') as String,
        imageUrls: _asStringList(m['photo_urls']),
        youtubeUrls: _asStringList(m['youtube_urls']),
        latitude: (m['latitude'] as num?)?.toDouble(),
        longitude: (m['longitude'] as num?)?.toDouble(),
        address: m['address'] as String?,
        phone: m['phone'] as String?,
        isHomeTaste: (m['is_home_taste'] ?? false) as bool,
      );

  String get heroImageUrl => imageUrls.isNotEmpty ? imageUrls.first : '';
  int get videoCount => youtubeUrls.length;

  String titleFor(String locale) => locale.startsWith('es') ? titleEs : titleEn;
  String kickerFor(String locale) =>
      locale.startsWith('es') ? kickerEs : kickerEn;
  String descriptionFor(String locale) =>
      locale.startsWith('es') ? descriptionEs : descriptionEn;
}

/// A boutique / market / artisan / souvenir spot. Schema is intentionally
/// identical to [FoodSpot] — same media, location, phone, category — so the
/// detail screen can share the same layout.
@immutable
class Shop {
  final String id;
  final String titleEs;
  final String titleEn;
  final String kickerEs;
  final String kickerEn;
  final String descriptionEs;
  final String descriptionEn;
  final String categorySlug;
  final List<String> imageUrls;
  final List<String> youtubeUrls;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String? phone;

  const Shop({
    required this.id,
    required this.titleEs,
    required this.titleEn,
    required this.kickerEs,
    required this.kickerEn,
    required this.descriptionEs,
    required this.descriptionEn,
    required this.categorySlug,
    required this.imageUrls,
    required this.youtubeUrls,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.phone,
  });

  factory Shop.fromMap(Map<String, dynamic> m) => Shop(
        id: m['id'] as String,
        titleEs: (m['title_es'] ?? '') as String,
        titleEn: (m['title_en'] ?? '') as String,
        kickerEs: (m['kicker_es'] ?? '') as String,
        kickerEn: (m['kicker_en'] ?? '') as String,
        descriptionEs: (m['description_es'] ?? '') as String,
        descriptionEn: (m['description_en'] ?? '') as String,
        categorySlug: (m['category'] ?? 'souvenirs') as String,
        imageUrls: _asStringList(m['photo_urls']),
        youtubeUrls: _asStringList(m['youtube_urls']),
        latitude: (m['latitude'] as num?)?.toDouble(),
        longitude: (m['longitude'] as num?)?.toDouble(),
        address: m['address'] as String?,
        phone: m['phone'] as String?,
      );

  String get heroImageUrl => imageUrls.isNotEmpty ? imageUrls.first : '';
  int get videoCount => youtubeUrls.length;

  String titleFor(String locale) => locale.startsWith('es') ? titleEs : titleEn;
  String kickerFor(String locale) =>
      locale.startsWith('es') ? kickerEs : kickerEn;
  String descriptionFor(String locale) =>
      locale.startsWith('es') ? descriptionEs : descriptionEn;
}

/// A testimonial quote shown on the Review screen. Managed in the
/// backoffice — the admin typically pastes these in from real Google
/// reviews so they stay authentic while not requiring a live API fetch.
@immutable
class Review {
  final String id;
  final String quoteEs;
  final String quoteEn;
  final String author;
  final int rating;
  final String? sourceUrl;

  const Review({
    required this.id,
    required this.quoteEs,
    required this.quoteEn,
    required this.author,
    required this.rating,
    required this.sourceUrl,
  });

  factory Review.fromMap(Map<String, dynamic> m) => Review(
        id: m['id'] as String,
        quoteEs: (m['quote_es'] ?? '') as String,
        quoteEn: (m['quote_en'] ?? '') as String,
        author: (m['author'] ?? '') as String,
        rating: (m['rating'] ?? 5) as int,
        sourceUrl: m['source_url'] as String?,
      );

  /// Prefer the locale-matched quote, but gracefully fall back to the
  /// other language so a partially translated row still renders.
  String quoteFor(String locale) {
    if (locale.startsWith('es')) {
      return quoteEs.isNotEmpty ? quoteEs : quoteEn;
    }
    return quoteEn.isNotEmpty ? quoteEn : quoteEs;
  }
}

@immutable
class ImportantNumber {
  final String id;
  final String labelEs;
  final String labelEn;
  final String phoneNumber;
  final String categorySlug;
  final String icon;
  final String descriptionEs;
  final String descriptionEn;
  final int displayOrder;

  const ImportantNumber({
    required this.id,
    required this.labelEs,
    required this.labelEn,
    required this.phoneNumber,
    required this.categorySlug,
    required this.icon,
    required this.descriptionEs,
    required this.descriptionEn,
    required this.displayOrder,
  });

  factory ImportantNumber.fromMap(Map<String, dynamic> m) => ImportantNumber(
        id: m['id'] as String,
        labelEs: (m['label_es'] ?? '') as String,
        labelEn: (m['label_en'] ?? '') as String,
        phoneNumber: (m['phone_number'] ?? '') as String,
        categorySlug: (m['category'] ?? 'other') as String,
        icon: (m['icon'] ?? 'phone') as String,
        descriptionEs: (m['description_es'] ?? '') as String,
        descriptionEn: (m['description_en'] ?? '') as String,
        displayOrder: (m['display_order'] ?? 0) as int,
      );

  String labelFor(String locale) => locale.startsWith('es') ? labelEs : labelEn;
}

/// Guide/About + site-wide settings (all sourced from public.about_section).
@immutable
class SiteSettings {
  final String guideName;
  final String guideTaglineEs;
  final String guideTaglineEn;
  final String guideBioEs;
  final String guideBioEn;
  final String? guideAvatarUrl;
  final String statWalkers;
  final String statRating;
  final String statYears;
  final String googleReviewUrl;
  final String bookingUrl;
  final String instagramUrl;
  final String whatsappUrl;
  final String shareUrl;

  const SiteSettings({
    required this.guideName,
    required this.guideTaglineEs,
    required this.guideTaglineEn,
    required this.guideBioEs,
    required this.guideBioEn,
    required this.guideAvatarUrl,
    required this.statWalkers,
    required this.statRating,
    required this.statYears,
    required this.googleReviewUrl,
    required this.bookingUrl,
    required this.instagramUrl,
    required this.whatsappUrl,
    required this.shareUrl,
  });

  /// Build from the `about_section` singleton row. The app previously read
  /// these from a separate `site_settings` table; both are now consolidated
  /// into `about_section` (see migration 0007).
  factory SiteSettings.fromAboutRow(Map<String, dynamic> m) => SiteSettings(
        guideName: (m['guide_name'] ?? 'Valentina') as String,
        guideTaglineEs: (m['guide_tagline_es'] ?? '') as String,
        guideTaglineEn: (m['guide_tagline_en'] ?? '') as String,
        guideBioEs: (m['body_es'] ?? '') as String,
        guideBioEn: (m['body_en'] ?? '') as String,
        guideAvatarUrl: m['image_url'] as String?,
        statWalkers: (m['stat_walkers'] ?? '') as String,
        statRating: (m['stat_rating'] ?? '') as String,
        statYears: (m['stat_years'] ?? '') as String,
        googleReviewUrl: (m['google_review_url'] ?? '') as String,
        bookingUrl: (m['booking_url'] ?? '') as String,
        instagramUrl: (m['instagram_url'] ?? '') as String,
        whatsappUrl: (m['whatsapp_url'] ?? '') as String,
        shareUrl: (m['share_url'] ?? '') as String,
      );

  String bioFor(String locale) =>
      locale.startsWith('es') ? guideBioEs : guideBioEn;
  String taglineFor(String locale) =>
      locale.startsWith('es') ? guideTaglineEs : guideTaglineEn;

  static const fallback = SiteSettings(
    guideName: 'Valentina',
    guideTaglineEs: 'Guía de caminata libre, Sarajevo',
    guideTaglineEn: 'Free walking tour guide, Sarajevo',
    guideBioEs:
        'Hola, soy Valentina. Caminar por Sarajevo es entrar en una conversación entre imperios, guerras y cafés al atardecer. Te llevaré a los lugares que yo elegiría para una amiga — sin prisas, con historias reales.',
    guideBioEn:
        "Hi, I'm Valentina. Walking Sarajevo is stepping into a conversation between empires, wars, and sunset coffees. I'll take you where I'd take a friend — unhurried, with real stories.",
    guideAvatarUrl: null,
    statWalkers: '1,240+',
    statRating: '4.9',
    statYears: '6 yr',
    googleReviewUrl: '',
    bookingUrl: '',
    instagramUrl: '',
    whatsappUrl: '',
    shareUrl: '',
  );
}

// ─── helpers ────────────────────────────────────────────────

/// Supabase returns `text[]` columns as a `List<dynamic>`. Normalize to a
/// trimmed list of non-empty strings.
List<String> _asStringList(dynamic raw) {
  if (raw is! List) return const [];
  return raw
      .whereType<String>()
      .map((s) => s.trim())
      .where((s) => s.isNotEmpty)
      .toList();
}
