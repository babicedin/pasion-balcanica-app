import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../theme/palette.dart';
import '../util/launchers.dart';
import '../widgets/image.dart';
import '../widgets/mini_map.dart';
import '../widgets/photo_viewer.dart';
import '../widgets/primitives.dart';

/// Food spot detail — mirrors PlaceDetailScreen with a category pill, a
/// phone-call action, and (if any) a YouTube videos row.
class FoodDetailScreen extends ConsumerStatefulWidget {
  final FoodSpot spot;
  const FoodDetailScreen({super.key, required this.spot});

  @override
  ConsumerState<FoodDetailScreen> createState() => _FoodDetailScreenState();
}

class _FoodDetailScreenState extends ConsumerState<FoodDetailScreen> {
  late final PageController _heroController;
  int _heroIndex = 0;

  @override
  void initState() {
    super.initState();
    _heroController = PageController();
  }

  @override
  void dispose() {
    _heroController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final locale = ref.watch(localeProvider);
    final s = S.of(locale);
    final spot = widget.spot;

    // Pull category label from the dynamic categories table. Fallback to the
    // slug itself when the table doesn't yet contain it.
    final categoriesAsync = ref.watch(foodCategoriesProvider);
    final category = (categoriesAsync.asData?.value ?? const <CategoryInfo>[])
            .firstWhere(
          (c) => c.slug == spot.categorySlug,
          orElse: () => CategoryInfo.unknown(spot.categorySlug),
        );

    final heroUrls = spot.imageUrls.isNotEmpty
        ? spot.imageUrls
        : <String>[spot.heroImageUrl];

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
      child: Scaffold(
        extendBody: true,
        extendBodyBehindAppBar: true,
        backgroundColor: pb.bg,
        body: Stack(
          children: [
            Column(
              children: [
                SizedBox(
                  height: 340,
                  width: double.infinity,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      PageView.builder(
                        controller: _heroController,
                        itemCount: heroUrls.length,
                        physics: heroUrls.length > 1
                            ? const PageScrollPhysics()
                            : const NeverScrollableScrollPhysics(),
                        onPageChanged: (i) => setState(() => _heroIndex = i),
                        itemBuilder: (_, i) => GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: () => PhotoViewerScreen.open(
                            context,
                            urls: heroUrls,
                            initialIndex: i,
                          ),
                          child: PBImage(url: heroUrls[i]),
                        ),
                      ),
                      const IgnorePointer(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Color(0x991A1512), Colors.transparent],
                              stops: [0, 0.4],
                            ),
                          ),
                        ),
                      ),
                      const IgnorePointer(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Color(0x4D000000)],
                              stops: [0.5, 1],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        left: 16,
                        bottom: 52,
                        child: _CategoryGradientPill(
                          label: category.labelFor(locale),
                        ),
                      ),
                      if (heroUrls.length > 1)
                        Positioned(
                          right: 16,
                          bottom: 52,
                          child: _CountPill(
                            current: _heroIndex + 1,
                            count: heroUrls.length,
                          ),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  child: _Info(spot: spot, locale: locale, s: s),
                ),
              ],
            ),

            Positioned(
              top: MediaQuery.of(context).padding.top + 8,
              left: 16,
              right: 16,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _CircleGlass(
                    icon: Icons.chevron_left_rounded,
                    onTap: () => Navigator.of(context).maybePop(),
                  ),
                  _CircleGlass(
                    icon: Icons.ios_share_rounded,
                    onTap: () {
                      // Build a short share message from the spot's title
                      // + kicker — good enough for copy/paste into a chat.
                      final title = spot.titleFor(locale);
                      final kicker = spot.kickerFor(locale);
                      final parts = <String>[
                        title,
                        if (kicker.isNotEmpty) kicker,
                      ];
                      Launchers.share(
                        text: parts.join(' · '),
                        subject: title,
                      );
                    },
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

class _Info extends StatelessWidget {
  final FoodSpot spot;
  final String locale;
  final S s;
  const _Info({required this.spot, required this.locale, required this.s});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final hasPhone = spot.phone != null && spot.phone!.trim().isNotEmpty;

    return Transform.translate(
      offset: const Offset(0, -32),
      child: Container(
        decoration: BoxDecoration(
          color: pb.bg,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 2, bottom: 14),
                  width: 38,
                  height: 4,
                  decoration: BoxDecoration(
                    color: pb.hairline,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              if (spot.kickerFor(locale).isNotEmpty) ...[
                Kicker(spot.kickerFor(locale).toUpperCase()),
                const SizedBox(height: 6),
              ],
              Text(
                spot.titleFor(locale),
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                      fontSize: 28,
                      letterSpacing: -0.42,
                      color: pb.ink,
                    ),
              ),

              const SizedBox(height: 14),
              Row(
                children: [
                  ActionBtn(
                    primary: true,
                    icon: const Icon(Icons.place_rounded, size: 14),
                    label: s.directions,
                    onTap: () {
                      if (spot.latitude != null && spot.longitude != null) {
                        Launchers.directions(
                          lat: spot.latitude!,
                          lng: spot.longitude!,
                          label: spot.titleFor(locale),
                        );
                      } else if ((spot.address ?? '').trim().isNotEmpty) {
                        Launchers.directionsToAddress(spot.address!);
                      }
                    },
                  ),
                  const SizedBox(width: 8),
                  ActionBtn(
                    icon: const Icon(Icons.call_rounded, size: 14),
                    label: s.call,
                    onTap: () {
                      if (hasPhone) Launchers.call(spot.phone!);
                    },
                  ),
                ],
              ),

              const SizedBox(height: 18),
              Text(
                spot.descriptionFor(locale),
                style: TextStyle(
                  fontSize: 14,
                  color: pb.ink2,
                  height: 1.55,
                ),
              ),

              const SizedBox(height: 22),
              SectionHeader(s.location.toUpperCase()),
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () {
                  if (spot.latitude != null && spot.longitude != null) {
                    Launchers.directions(
                      lat: spot.latitude!,
                      lng: spot.longitude!,
                      label: spot.titleFor(locale),
                    );
                  } else if ((spot.address ?? '').trim().isNotEmpty) {
                    Launchers.directionsToAddress(spot.address!);
                  }
                },
                child: MiniMap(
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                ),
              ),
              if (spot.latitude != null && spot.longitude != null) ...[
                const SizedBox(height: 8),
                Text(
                  _fmt(spot.latitude!, spot.longitude!),
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: pb.ink3,
                  ),
                ),
              ],

              if (spot.imageUrls.length > 1) ...[
                const SizedBox(height: 22),
                SectionHeader(s.gallery.toUpperCase()),
                _Gallery(urls: spot.imageUrls),
              ],

              if (spot.youtubeUrls.isNotEmpty) ...[
                const SizedBox(height: 22),
                SectionHeader(s.videos.toUpperCase()),
                _VideoList(urls: spot.youtubeUrls),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _fmt(double lat, double lng) =>
      '${lat.abs().toStringAsFixed(4)}° ${lat >= 0 ? 'N' : 'S'},  '
      '${lng.abs().toStringAsFixed(4)}° ${lng >= 0 ? 'E' : 'W'}';
}

class _CountPill extends StatelessWidget {
  final int current;
  final int count;
  const _CountPill({required this.current, required this.count});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.45),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.photo_outlined, color: Colors.white, size: 11),
              const SizedBox(width: 5),
              Text(
                '$current / $count',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Gallery extends StatelessWidget {
  final List<String> urls;
  const _Gallery({required this.urls});

  @override
  Widget build(BuildContext context) {
    final rest = urls.skip(1).take(6).toList();
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.zero,
      itemCount: rest.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 6,
        mainAxisSpacing: 6,
        childAspectRatio: 1,
      ),
      itemBuilder: (_, i) => Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: () => PhotoViewerScreen.open(
            context,
            urls: urls,
            initialIndex: i + 1,
          ),
          child: PBImage(url: rest[i]),
        ),
      ),
    );
  }
}

class _VideoList extends StatelessWidget {
  final List<String> urls;
  const _VideoList({required this.urls});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Column(
      children: [
        for (var i = 0; i < urls.length; i++) ...[
          if (i > 0) const SizedBox(height: 8),
          Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(14),
            child: InkWell(
              onTap: () => Launchers.playVideo(urls[i]),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: pb.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: pb.surfaceBorder),
                ),
                child: Row(
                  children: [
                    const PBVideoThumb(),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'YouTube',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: pb.ink,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            urls[i],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 11, color: pb.ink3),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.open_in_new_rounded,
                      size: 16,
                      color: pb.ink3,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _CategoryGradientPill extends StatelessWidget {
  final String label;
  const _CategoryGradientPill({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        gradient: PBBrand.gradient,
        borderRadius: BorderRadius.circular(999),
        boxShadow: const [
          BoxShadow(
            color: Color(0x59B8283F),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Colors.white,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _CircleGlass extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _CircleGlass({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ClipOval(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Material(
          color: Colors.black.withOpacity(0.35),
          child: InkWell(
            onTap: onTap,
            child: SizedBox(
              width: 36,
              height: 36,
              child: Icon(icon, size: 18, color: Colors.white),
            ),
          ),
        ),
      ),
    );
  }
}
