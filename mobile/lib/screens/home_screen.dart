import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../theme/palette.dart';
import '../widgets/image.dart';
import '../widgets/primitives.dart';
import 'about_screen.dart';
import 'food_detail_screen.dart';
import 'place_detail_screen.dart';

/// Home feed — greeting, hero card, quick shortcuts, featured carousel,
/// "Taste of Sarajevo" grid, and a tap-to-meet About teaser.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pb = context.pb;
    final locale = ref.watch(localeProvider);
    final s = S.of(locale);

    final placesAsync = ref.watch(placesProvider);
    final foodAsync = ref.watch(foodSpotsProvider);
    final shopsAsync = ref.watch(shopsProvider);
    final foodCategoriesAsync = ref.watch(foodCategoriesProvider);
    final foodCategories =
        foodCategoriesAsync.asData?.value ?? const <CategoryInfo>[];
    final categoryBySlug = <String, CategoryInfo>{
      for (final c in foodCategories) c.slug: c,
    };
    final settingsAsync = ref.watch(siteSettingsProvider);
    final settings = settingsAsync.asData?.value ?? SiteSettings.fallback;

    final places = placesAsync.asData?.value ?? const <Place>[];
    final food = foodAsync.asData?.value ?? const <FoodSpot>[];
    final shops = shopsAsync.asData?.value ?? const <Shop>[];

    final homePickCandidates = places.where((p) => p.isHomePick);
    final hero = homePickCandidates.isNotEmpty
        ? homePickCandidates.first
        : (places.length > 1
            ? places[1]
            : (places.isNotEmpty ? places.first : null));
    final curatedFeatured = places.where((p) => p.isHomeMustSee).toList();
    final featured =
        curatedFeatured.isNotEmpty ? curatedFeatured : places.take(3).toList();
    final curatedTaste = food.where((f) => f.isHomeTaste).toList();
    final taste =
        curatedTaste.isNotEmpty ? curatedTaste : food.take(4).toList();

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: [
          const SliverToBoxAdapter(child: PBHeader()),

          // Greeting
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 6, 20, 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Kicker(s.welcome),
                  const SizedBox(height: 8),
                  _DiscoverHeadline(locale: locale),
                ],
              ),
            ),
          ),

          // Hero card
          if (hero != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _HeroCard(
                  place: hero,
                  locale: locale,
                  onTap: () => _openPlace(context, hero),
                ),
              ),
            ),

          // Quick shortcuts: Places / Restaurants / Shopping
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 6),
              child: Row(
                children: [
                  Expanded(
                    child: _ShortcutTile(
                      icon: Icons.place_rounded,
                      tint: PBBrand.red,
                      label: s.placesLabel,
                      count: places.length,
                      countSuffix: s.pins,
                      // Jump to the Places tab (index 1 — see home_shell.dart).
                      onTap: () =>
                          ref.read(activeTabIndexProvider.notifier).state = 1,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _ShortcutTile(
                      icon: Icons.restaurant_rounded,
                      tint: PBBrand.indigo,
                      label: s.restaurantsLabel,
                      count: food.length,
                      countSuffix: s.pins,
                      // Jump to the Food tab (index 2).
                      onTap: () =>
                          ref.read(activeTabIndexProvider.notifier).state = 2,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _ShortcutTile(
                      icon: Icons.shopping_bag_rounded,
                      tint: PBBrand.magenta,
                      label: s.shoppingLabel,
                      count: shops.length,
                      countSuffix: s.pins,
                      // Jump to the Shopping tab (index 3).
                      onTap: () =>
                          ref.read(activeTabIndexProvider.notifier).state = 3,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Featured places — horizontal scroll
          if (featured.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        s.mustSeePlaces,
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                    ),
                    Text(
                      '${s.seeAll} ›',
                      style: TextStyle(
                        fontSize: 12,
                        color: pb.ink3,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 200,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
                  itemCount: featured.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, i) => _FeaturedPlaceCard(
                    place: featured[i],
                    locale: locale,
                    onTap: () => _openPlace(context, featured[i]),
                  ),
                ),
              ),
            ),
          ],

          // Taste of Sarajevo
          if (taste.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      s.tasteOfSarajevo,
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 12),
                    _TasteGrid(
                      items: taste,
                      locale: locale,
                      categoryBySlug: categoryBySlug,
                      onTap: (f) => _openFood(context, f),
                    ),
                  ],
                ),
              ),
            ),

          // About teaser
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
              child: _AboutTeaser(
                locale: locale,
                settings: settings,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const AboutScreen()),
                ),
              ),
            ),
          ),

          // Bottom padding so the floating nav doesn't clip the last row.
          const SliverToBoxAdapter(child: SizedBox(height: 120)),
        ],
      ),
    );
  }

  void _openPlace(BuildContext context, Place p) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => PlaceDetailScreen(place: p)),
    );
  }

  void _openFood(BuildContext context, FoodSpot f) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => FoodDetailScreen(spot: f)),
    );
  }
}

class _DiscoverHeadline extends StatelessWidget {
  final String locale;
  const _DiscoverHeadline({required this.locale});

  @override
  Widget build(BuildContext context) {
    final s = S.of(locale);
    return AccentHeadline(
      pre: s.discoverPre(''),
      accent: 'Sarajevo',
      post: s.discoverPost(),
      fontSize: 32,
      letterSpacing: -0.48,
    );
  }
}

class _HeroCard extends StatelessWidget {
  final Place place;
  final String locale;
  final VoidCallback onTap;
  const _HeroCard({
    required this.place,
    required this.locale,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final s = S.of(locale);

    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Container(
          height: 260,
          decoration: BoxDecoration(
            color: pb.bgElev,
            boxShadow: pb.glassShadow,
          ),
          child: Stack(
            fit: StackFit.expand,
            children: [
              PBImage(url: place.heroImageUrl),
              // bottom scrim
              const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, Color(0xB3000000)],
                    stops: [0.35, 1],
                  ),
                ),
              ),
              Positioned(
                top: 14,
                left: 14,
                child: _FrostedPill(
                  child: Text(
                    s.todaysPick,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
              Positioned(
                left: 18,
                right: 18,
                bottom: 18,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place.kickerFor(locale).toUpperCase(),
                      style: const TextStyle(
                        fontSize: 11,
                        color: Colors.white70,
                        letterSpacing: 1,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      place.titleFor(locale),
                      style:
                          Theme.of(context).textTheme.headlineLarge?.copyWith(
                                color: Colors.white,
                                fontSize: 28,
                                letterSpacing: -0.28,
                              ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      place.descriptionFor(locale),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xE0FFFFFF),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Small frosted-glass pill (badge) used on top of hero images.
class _FrostedPill extends StatelessWidget {
  final Widget child;
  const _FrostedPill({required this.child});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.18),
            border: Border.all(color: Colors.white.withOpacity(0.25)),
            borderRadius: BorderRadius.circular(999),
          ),
          child: child,
        ),
      ),
    );
  }
}

class _ShortcutTile extends StatelessWidget {
  final IconData icon;
  final Color tint;
  final String label;
  final int count;
  final String countSuffix;
  final VoidCallback? onTap;

  const _ShortcutTile({
    required this.icon,
    required this.tint,
    required this.label,
    required this.count,
    required this.countSuffix,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: pb.surface,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: pb.surfaceBorder),
            boxShadow: pb.glassShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  gradient: PBBrand.gradientSoft,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 18, color: tint),
              ),
              const SizedBox(height: 10),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: pb.ink,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '$count $countSuffix',
                style: TextStyle(fontSize: 12, color: pb.ink3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeaturedPlaceCard extends StatelessWidget {
  final Place place;
  final String locale;
  final VoidCallback onTap;
  const _FeaturedPlaceCard({
    required this.place,
    required this.locale,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final kickerFirst = place.kickerFor(locale).split('·').first.trim();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 180,
        decoration: BoxDecoration(
          color: pb.bgElev,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: pb.hairline),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 120,
              width: double.infinity,
              child: PBImage(url: place.heroImageUrl),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    kickerFirst.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                      color: pb.ink3,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    place.titleFor(locale),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontSize: 16,
                          color: pb.ink,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TasteGrid extends StatelessWidget {
  final List<FoodSpot> items;
  final String locale;
  final Map<String, CategoryInfo> categoryBySlug;
  final ValueChanged<FoodSpot> onTap;
  const _TasteGrid({
    required this.items,
    required this.locale,
    required this.categoryBySlug,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 160 / 170,
      ),
      itemCount: items.length,
      itemBuilder: (_, i) {
        final item = items[i];
        return _TasteTile(
          item: item,
          locale: locale,
          category: categoryBySlug[item.categorySlug] ??
              CategoryInfo.unknown(item.categorySlug),
          onTap: () => onTap(item),
        );
      },
    );
  }
}

class _TasteTile extends StatelessWidget {
  final FoodSpot item;
  final String locale;
  final CategoryInfo category;
  final VoidCallback onTap;
  const _TasteTile({
    required this.item,
    required this.locale,
    required this.category,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final kickerFirst = item.kickerFor(locale).split('·').first.trim();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: pb.bgElev,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: pb.hairline),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  PBImage(url: item.heroImageUrl),
                  Positioned(
                    top: 6,
                    left: 6,
                    child: _FrostedPill(
                      child: Text(
                        category.labelFor(locale).toUpperCase(),
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.titleFor(locale),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontSize: 14,
                          letterSpacing: -0.07,
                          color: pb.ink,
                        ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    kickerFirst,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 11, color: pb.ink3),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AboutTeaser extends StatelessWidget {
  final String locale;
  final SiteSettings settings;
  final VoidCallback onTap;
  const _AboutTeaser({
    required this.locale,
    required this.settings,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final s = S.of(locale);
    final guideName =
        settings.guideName.isEmpty ? 'Valentina' : settings.guideName;
    final tagline = settings.taglineFor(locale).isEmpty
        ? s.freeWalkingTour
        : settings.taglineFor(locale);
    final avatarUrl = settings.guideAvatarUrl;
    final hasAvatar = avatarUrl != null && avatarUrl.isNotEmpty;

    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: pb.surface,
              border: Border.all(color: pb.surfaceBorder),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: PBBrand.gradient,
                  ),
                  alignment: Alignment.center,
                  child: hasAvatar
                      ? ClipOval(
                          child: SizedBox(
                            width: 52,
                            height: 52,
                            child: PBImage(url: avatarUrl),
                          ),
                        )
                      : Text(
                          guideName.isNotEmpty
                              ? guideName[0].toUpperCase()
                              : 'V',
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                                color: Colors.white,
                                fontSize: 22,
                              ),
                        ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        s.yourGuide,
                        style: TextStyle(
                          fontSize: 11,
                          color: pb.ink3,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$guideName · $tagline',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: pb.ink,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'ES · EN · BCS · ${s.tapToMeet}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 12, color: pb.ink2),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right_rounded, size: 22, color: pb.ink3),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
