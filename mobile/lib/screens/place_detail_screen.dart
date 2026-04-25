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

/// Full-bleed hero + frosted info card sliding up — mirrors the Apple Maps
/// "Look Around" pattern. Safe area is ignored so the hero reaches the top.
class PlaceDetailScreen extends ConsumerStatefulWidget {
  final Place place;
  const PlaceDetailScreen({super.key, required this.place});

  @override
  ConsumerState<PlaceDetailScreen> createState() => _PlaceDetailScreenState();
}

class _PlaceDetailScreenState extends ConsumerState<PlaceDetailScreen> {
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
    final place = widget.place;

    // Always have at least one entry so the PageView still renders even when
    // a place has no uploaded photos yet (PBImage falls back to a placeholder).
    final heroUrls = place.imageUrls.isNotEmpty
        ? place.imageUrls
        : <String>[place.heroImageUrl];

    // Hero takes the status-bar-dark style while the card is scrolled up.
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
                // Hero — swipeable when there are multiple photos.
                SizedBox(
                  height: 360,
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
                      // top scrim to keep status bar icons legible
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
                      // bottom wash so the glass card edge doesn't look harsh
                      const IgnorePointer(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Color(0x59000000)],
                              stops: [0.5, 1],
                            ),
                          ),
                        ),
                      ),
                      // Image-count pill — tracks the live PageView index.
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
                  child: _InfoCard(place: place, locale: locale, s: s),
                ),
              ],
            ),

            // Overlay controls sit above everything.
            Positioned(
              top: MediaQuery.of(context).padding.top + 8,
              left: 16,
              right: 16,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _HeroCircleBtn(
                    icon: Icons.chevron_left_rounded,
                    onTap: () => Navigator.of(context).maybePop(),
                  ),
                  _HeroCircleBtn(
                    icon: Icons.ios_share_rounded,
                    onTap: () {
                      // Build a short message for the system share sheet.
                      final title = place.titleFor(locale);
                      final kicker = place.kickerFor(locale);
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

class _InfoCard extends StatelessWidget {
  final Place place;
  final String locale;
  final S s;
  const _InfoCard({required this.place, required this.locale, required this.s});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;

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

              Kicker(place.kickerFor(locale).toUpperCase()),
              const SizedBox(height: 6),
              Text(
                place.titleFor(locale),
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                      fontSize: 30,
                      letterSpacing: -0.45,
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
                    // Prefer lat/lng for directions. Fall back to the
                    // address string so spots without a pin still work.
                    onTap: () {
                      if (place.latitude != null && place.longitude != null) {
                        Launchers.directions(
                          lat: place.latitude!,
                          lng: place.longitude!,
                          label: place.titleFor(locale),
                        );
                      } else if ((place.address ?? '').trim().isNotEmpty) {
                        Launchers.directionsToAddress(place.address!);
                      }
                    },
                  ),
                  const SizedBox(width: 8),
                  ActionBtn(
                    icon: const Icon(Icons.play_arrow_rounded, size: 14),
                    label: s.video,
                    // Open the first YouTube link in an in-app browser
                    // popup (Custom Tabs / Safari VC) so the viewer never
                    // fully leaves the app.
                    onTap: () {
                      if (place.youtubeUrls.isNotEmpty) {
                        Launchers.playVideo(place.youtubeUrls.first);
                      }
                    },
                  ),
                ],
              ),

              const SizedBox(height: 18),
              Text(
                place.descriptionFor(locale),
                style: TextStyle(
                  fontSize: 14,
                  color: pb.ink2,
                  height: 1.55,
                ),
              ),

              const SizedBox(height: 22),
              SectionHeader(s.location.toUpperCase()),
              // Tapping the mini-map launches Google Maps the same way the
              // "Directions" action button does.
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () {
                  if (place.latitude != null && place.longitude != null) {
                    Launchers.directions(
                      lat: place.latitude!,
                      lng: place.longitude!,
                      label: place.titleFor(locale),
                    );
                  } else if ((place.address ?? '').trim().isNotEmpty) {
                    Launchers.directionsToAddress(place.address!);
                  }
                },
                child: MiniMap(
                  latitude: place.latitude,
                  longitude: place.longitude,
                ),
              ),
              if (place.latitude != null && place.longitude != null) ...[
                const SizedBox(height: 8),
                Text(
                  _formatCoords(place.latitude!, place.longitude!),
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: pb.ink3,
                    letterSpacing: 0.2,
                  ),
                ),
              ],

              if (place.imageUrls.length > 1) ...[
                const SizedBox(height: 22),
                SectionHeader(s.gallery.toUpperCase()),
                _GalleryGrid(urls: place.imageUrls),
              ],

              if (place.youtubeUrls.isNotEmpty) ...[
                const SizedBox(height: 22),
                SectionHeader(s.videos.toUpperCase()),
                _VideoList(urls: place.youtubeUrls),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatCoords(double lat, double lng) {
    final latDir = lat >= 0 ? 'N' : 'S';
    final lngDir = lng >= 0 ? 'E' : 'W';
    return '${lat.abs().toStringAsFixed(4)}° $latDir,  '
        '${lng.abs().toStringAsFixed(4)}° $lngDir';
  }
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

/// Frosted circular button used as hero overlay controls (back / share / fav).
class _HeroCircleBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _HeroCircleBtn({required this.icon, required this.onTap});

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

class _GalleryGrid extends StatelessWidget {
  final List<String> urls;
  const _GalleryGrid({required this.urls});

  @override
  Widget build(BuildContext context) {
    // First image is the hero, so drop it and show the rest up to 6. We
    // pass the *full* `urls` list to the viewer so the user can swipe back
    // to the hero image too — `initialIndex` is offset by +1 to land on the
    // tapped thumbnail.
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
