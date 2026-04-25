import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../theme/palette.dart';
import '../util/launchers.dart';
import '../widgets/primitives.dart';

/// Review screen — funnels satisfied walkers to the Google review page and
/// offers lightweight secondary share actions.
///
/// The featured testimonial is pulled from the `reviews` table (managed in
/// the backoffice). When no reviews are published we simply hide the card
/// rather than falling back to placeholder copy.
class ReviewScreen extends ConsumerWidget {
  const ReviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pb = context.pb;
    final locale = ref.watch(localeProvider);
    final s = S.of(locale);
    final settings = ref.watch(siteSettingsProvider).asData?.value;
    final reviews = ref.watch(reviewsProvider).asData?.value ?? const <Review>[];

    void snack(String message) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(message)));
    }

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
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Kicker(s.yourVoiceMatters),
                  const SizedBox(height: 8),
                  AccentHeadline(
                    pre: s.leaveReviewPre,
                    accent: s.leaveReviewAccent,
                    fontSize: 32,
                    letterSpacing: -0.48,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    s.reviewLead,
                    style: TextStyle(
                      fontSize: 14,
                      color: pb.ink2,
                      height: 1.55,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Testimonial cards — swipe through all published reviews.
          if (reviews.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 22, 20, 0),
                child: _TestimonialsCarousel(
                  reviews: reviews,
                  locale: locale,
                  fallbackAttribution: s.recentReview,
                ),
              ),
            ),

          // Primary CTA — Review on Google
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 0),
              child: Column(
                children: [
                  _GoogleReviewButton(
                    label: s.reviewOnGoogle,
                    onTap: () {
                      final url = settings?.googleReviewUrl ?? '';
                      if (url.isEmpty) {
                        snack(s.googleReviewNotSet);
                        return;
                      }
                      Launchers.open(url);
                    },
                  ),
                  const SizedBox(height: 10),
                  Text(
                    s.opensGoogleMaps,
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: pb.ink3),
                  ),
                ],
              ),
            ),
          ),

          // Secondary share actions
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 120),
              child: Row(
                children: [
                  _ShareTile(
                    icon: Icons.ios_share_rounded,
                    label: s.shareApp,
                    onTap: () {
                      // Share the configured URL if present, otherwise fall
                      // back to the localized invite copy.
                      final url = settings?.shareUrl ?? '';
                      final text = url.isNotEmpty
                          ? '${s.shareAppText}\n$url'
                          : s.shareAppText;
                      Launchers.share(text: text, subject: s.shareAppText);
                    },
                  ),
                  const SizedBox(width: 10),
                  _ShareTile(
                    icon: Icons.camera_alt_outlined,
                    label: s.instagram,
                    onTap: () {
                      final url = settings?.instagramUrl ?? '';
                      if (url.isEmpty) {
                        snack(s.instagramNotSet);
                        return;
                      }
                      Launchers.open(url);
                    },
                  ),
                  const SizedBox(width: 10),
                  _ShareTile(
                    icon: Icons.wechat_rounded,
                    label: s.whatsapp,
                    onTap: () {
                      final url = settings?.whatsappUrl ?? '';
                      if (url.isEmpty) {
                        snack(s.whatsappNotSet);
                        return;
                      }
                      Launchers.open(url);
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TestimonialsCarousel extends StatefulWidget {
  final List<Review> reviews;
  final String locale;
  final String fallbackAttribution;
  const _TestimonialsCarousel({
    required this.reviews,
    required this.locale,
    required this.fallbackAttribution,
  });

  @override
  State<_TestimonialsCarousel> createState() => _TestimonialsCarouselState();
}

class _TestimonialsCarouselState extends State<_TestimonialsCarousel> {
  late final PageController _controller;
  int _index = 0;

  @override
  void initState() {
    super.initState();
    _controller = PageController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reviews = widget.reviews;
    final canSwipe = reviews.length > 1;

    return Column(
      children: [
        SizedBox(
          height: 305,
          child: PageView.builder(
            controller: _controller,
            itemCount: reviews.length,
            physics: canSwipe
                ? const PageScrollPhysics()
                : const NeverScrollableScrollPhysics(),
            onPageChanged: (i) => setState(() => _index = i),
            itemBuilder: (_, i) {
              final review = reviews[i];
              final attribution = review.author.isNotEmpty
                  ? '— ${review.author}'
                  : '— ${widget.fallbackAttribution}';
              return _TestimonialCard(
                quote: review.quoteFor(widget.locale),
                attribution: attribution,
                rating: review.rating,
                tapHint: S.of(widget.locale).tapToReadFullReview,
                onTap: () => _showReviewDialog(
                  context,
                  quote: review.quoteFor(widget.locale),
                  attribution: attribution,
                  rating: review.rating,
                ),
              );
            },
          ),
        ),
        if (canSwipe) ...[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              reviews.length,
              (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                height: 6,
                width: i == _index ? 18 : 6,
                decoration: BoxDecoration(
                  color: i == _index
                      ? PBBrand.magenta
                      : PBBrand.magenta.withOpacity(0.28),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  void _showReviewDialog(
    BuildContext context, {
    required String quote,
    required String attribution,
    required int rating,
  }) {
    final stars = rating.clamp(1, 5);
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: List.generate(
            stars,
            (_) => const Padding(
              padding: EdgeInsets.only(right: 2),
              child: Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 18),
            ),
          ),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                quote,
                style: const TextStyle(height: 1.45),
              ),
              const SizedBox(height: 10),
              Text(
                attribution,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF6B7280),
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

class _TestimonialCard extends StatelessWidget {
  final String quote;
  final String attribution;
  final int rating;
  final String tapHint;
  final VoidCallback? onTap;
  const _TestimonialCard({
    required this.quote,
    required this.attribution,
    required this.rating,
    required this.tapHint,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final starCount = rating.clamp(1, 5);
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          gradient: PBBrand.gradient,
          borderRadius: BorderRadius.circular(24),
          boxShadow: const [
            BoxShadow(
              color: Color(0x59B8283F),
              blurRadius: 40,
              offset: Offset(0, 12),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Decorative white blobs
            Positioned(
              top: -40,
              right: -30,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.14),
                ),
              ),
            ),
            Positioned(
              bottom: -30,
              left: -20,
              child: Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.10),
                ),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: List.generate(
                    starCount,
                    (_) => const Padding(
                      padding: EdgeInsets.only(right: 4),
                      child: Icon(Icons.star_rounded, color: Colors.white, size: 26),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  quote,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontSize: 22,
                        height: 1.15,
                        letterSpacing: -0.22,
                        fontStyle: FontStyle.italic,
                        fontWeight: FontWeight.w500,
                      ),
                ),
                const SizedBox(height: 10),
                Text(
                  attribution,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.82),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  tapHint,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.white.withOpacity(0.85),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _GoogleReviewButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _GoogleReviewButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: PBBrand.gradient,
            borderRadius: BorderRadius.circular(16),
            boxShadow: pb.glassShadow,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                ),
                alignment: Alignment.center,
                child: Text(
                  'G',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF4285F4),
                      ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: pb.bg,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShareTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ShareTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Expanded(
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
            decoration: BoxDecoration(
              color: pb.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: pb.surfaceBorder),
            ),
            child: Column(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    gradient: PBBrand.gradientSoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Icon(icon, size: 14, color: PBBrand.magenta),
                ),
                const SizedBox(height: 8),
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: pb.ink2,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
