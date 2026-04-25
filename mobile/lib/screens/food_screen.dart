import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../theme/palette.dart';
import '../widgets/image.dart';
import '../widgets/primitives.dart';
import 'food_detail_screen.dart';

/// Food / restaurants browser: dynamic category chips (driven by the
/// backoffice-managed `food_categories` table) + 2-up grid.
///
/// Active filter is tracked by category slug. Empty slug == "All".
class FoodScreen extends ConsumerStatefulWidget {
  const FoodScreen({super.key});

  @override
  ConsumerState<FoodScreen> createState() => _FoodScreenState();
}

class _FoodScreenState extends ConsumerState<FoodScreen> {
  String? _activeSlug;

  @override
  Widget build(BuildContext context) {
    final locale = ref.watch(localeProvider);
    final s = S.of(locale);
    final async = ref.watch(foodSpotsProvider);
    final categoriesAsync = ref.watch(foodCategoriesProvider);
    final all = async.asData?.value ?? const <FoodSpot>[];
    final allCategories =
        categoriesAsync.asData?.value ?? const <CategoryInfo>[];

    // Only render a chip for a category that has at least one spot in the
    // current result set, but preserve the admin-defined display order.
    final presentSlugs = <String>{for (final f in all) f.categorySlug};
    final categories = allCategories
        .where((c) => presentSlugs.contains(c.slug))
        .toList();

    // Label lookup used by cards / detail pills. Includes a fallback entry
    // for slugs that were deleted from the categories table but are still
    // referenced by a food spot.
    final labelBySlug = <String, CategoryInfo>{
      for (final c in allCategories) c.slug: c,
      for (final slug in presentSlugs)
        if (!allCategories.any((c) => c.slug == slug))
          slug: CategoryInfo.unknown(slug),
    };

    final items = _activeSlug == null
        ? all
        : all.where((f) => f.categorySlug == _activeSlug).toList();

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: [
          const SliverToBoxAdapter(child: PBHeader()),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Kicker(s.eatAndDrink),
                  const SizedBox(height: 6),
                  AccentHeadline(
                    pre: s.whereLocalsEatPre,
                    accent: s.whereLocalsEatAccent,
                  ),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                itemCount: categories.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  if (i == 0) {
                    return FilterChipPB(
                      label: s.filterAll,
                      active: _activeSlug == null,
                      onTap: () => setState(() => _activeSlug = null),
                    );
                  }
                  final cat = categories[i - 1];
                  return FilterChipPB(
                    label: cat.labelFor(locale),
                    active: _activeSlug == cat.slug,
                    onTap: () => setState(() => _activeSlug = cat.slug),
                  );
                },
              ),
            ),
          ),

          if (async.isLoading)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding: EdgeInsets.only(top: 80),
                child: Center(child: CircularProgressIndicator()),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
              sliver: SliverGrid.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  // Slightly taller cells so two-line descriptions + the
                  // media-badge row fit without the "Bottom overflowed by
                  // 6.3 pixels" debug stripe on smaller phones.
                  childAspectRatio: 160 / 232,
                ),
                itemCount: items.length,
                itemBuilder: (_, i) => _FoodCard(
                  spot: items[i],
                  locale: locale,
                  category: labelBySlug[items[i].categorySlug] ??
                      CategoryInfo.unknown(items[i].categorySlug),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => FoodDetailScreen(spot: items[i]),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _FoodCard extends StatelessWidget {
  final FoodSpot spot;
  final String locale;
  final CategoryInfo category;
  final VoidCallback onTap;
  const _FoodCard({
    required this.spot,
    required this.locale,
    required this.category,
    required this.onTap,
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
          decoration: BoxDecoration(
            color: pb.bgElev,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: pb.hairline),
            boxShadow: pb.glassShadow,
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 120,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    PBImage(url: spot.heroImageUrl),
                    Positioned(
                      top: 8,
                      left: 8,
                      child: _CategoryGlassPill(
                        label: category.labelFor(locale),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      spot.titleFor(locale),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontSize: 15,
                            letterSpacing: -0.08,
                            color: pb.ink,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      spot.descriptionFor(locale),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 11,
                        color: pb.ink3,
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (spot.imageUrls.isNotEmpty)
                          MediaBadge(
                            icon: Icons.photo_outlined,
                            count: spot.imageUrls.length,
                          ),
                        if (spot.imageUrls.isNotEmpty && spot.videoCount > 0)
                          const SizedBox(width: 10),
                        if (spot.videoCount > 0)
                          MediaBadge(
                            icon: Icons.play_arrow_rounded,
                            count: spot.videoCount,
                          ),
                      ],
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

/// Frosted translucent pill badge (used over food card hero images).
class _CategoryGlassPill extends StatelessWidget {
  final String label;
  const _CategoryGlassPill({required this.label});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.22),
            border: Border.all(color: Colors.white.withOpacity(0.25)),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: Colors.white,
              letterSpacing: 0.4,
            ),
          ),
        ),
      ),
    );
  }
}
