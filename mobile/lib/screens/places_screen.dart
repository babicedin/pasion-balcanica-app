import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../theme/palette.dart';
import '../widgets/image.dart';
import '../widgets/primitives.dart';
import 'place_detail_screen.dart';

/// Explore list of hand-picked places — numbered cards, search field up top.
class PlacesScreen extends ConsumerStatefulWidget {
  const PlacesScreen({super.key});

  @override
  ConsumerState<PlacesScreen> createState() => _PlacesScreenState();
}

class _PlacesScreenState extends ConsumerState<PlacesScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final locale = ref.watch(localeProvider);
    final s = S.of(locale);
    final async = ref.watch(placesProvider);

    final all = async.asData?.value ?? const <Place>[];
    final filtered = _query.isEmpty
        ? all
        : all.where((p) {
            final q = _query.toLowerCase();
            return p.titleFor(locale).toLowerCase().contains(q) ||
                p.kickerFor(locale).toLowerCase().contains(q);
          }).toList();

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
                  Kicker(s.explore),
                  const SizedBox(height: 6),
                  AccentHeadline(
                    pre: s.placesToVisitPre,
                    accent: s.placesToVisitAccent,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    s.placesSubtitle(all.length),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: 13,
                          height: 1.4,
                        ),
                  ),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: _SearchField(
                placeholder: s.searchPlaces,
                onChanged: (v) => setState(() => _query = v),
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
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
              sliver: SliverList.separated(
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, i) => _PlaceRow(
                  place: filtered[i],
                  index: _indexOf(all, filtered[i]) + 1,
                  locale: locale,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => PlaceDetailScreen(place: filtered[i]),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  int _indexOf(List<Place> all, Place p) =>
      all.indexWhere((x) => x.id == p.id);
}

class _SearchField extends StatelessWidget {
  final String placeholder;
  final ValueChanged<String> onChanged;
  const _SearchField({required this.placeholder, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: pb.surface,
            border: Border.all(color: pb.surfaceBorder),
            borderRadius: BorderRadius.circular(14),
          ),
          child: TextField(
            onChanged: onChanged,
            style: TextStyle(fontSize: 14, color: pb.ink),
            cursorColor: PBBrand.red,
            decoration: InputDecoration(
              isDense: true,
              border: InputBorder.none,
              hintText: placeholder,
              hintStyle: TextStyle(fontSize: 14, color: pb.ink3),
              prefixIcon: Icon(Icons.search_rounded, size: 18, color: pb.ink3),
              prefixIconConstraints: const BoxConstraints(minWidth: 40, minHeight: 40),
              contentPadding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ),
      ),
    );
  }
}

class _PlaceRow extends StatelessWidget {
  final Place place;
  final int index;
  final String locale;
  final VoidCallback onTap;
  const _PlaceRow({
    required this.place,
    required this.index,
    required this.locale,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: pb.bgElev,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: pb.hairline),
            boxShadow: pb.glassShadow,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: SizedBox(
                      width: 92,
                      height: 92,
                      child: PBImage(url: place.heroImageUrl),
                    ),
                  ),
                  Positioned(
                    top: 6,
                    left: 6,
                    child: Container(
                      width: 22,
                      height: 22,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xF2FFFFFF),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '$index',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: PBBrand.magenta,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place.kickerFor(locale).toUpperCase(),
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
                            fontSize: 17,
                            letterSpacing: -0.08,
                            color: pb.ink,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      place.descriptionFor(locale),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        color: pb.ink2,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (place.imageUrls.isNotEmpty)
                          MediaBadge(
                            icon: Icons.photo_outlined,
                            count: place.imageUrls.length,
                          ),
                        if (place.imageUrls.isNotEmpty && place.videoCount > 0)
                          const SizedBox(width: 10),
                        if (place.videoCount > 0)
                          MediaBadge(
                            icon: Icons.play_arrow_rounded,
                            count: place.videoCount,
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
