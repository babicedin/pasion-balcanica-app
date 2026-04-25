import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/strings.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../theme/palette.dart';
import '../util/launchers.dart';
import '../widgets/image.dart';
import '../widgets/primitives.dart';

/// Minimal guide profile reached from the home teaser.
///
/// Pushed as a route (not a tab) so the back button lives on the hero card
/// and the bottom nav stays hidden — matches the "About guide" board in the
/// design canvas.
class AboutScreen extends ConsumerWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pb = context.pb;
    final locale = ref.watch(localeProvider);
    final s = S.of(locale);
    final settings =
        ref.watch(siteSettingsProvider).asData?.value ?? SiteSettings.fallback;

    return Scaffold(
      backgroundColor: pb.bg,
      body: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(
            parent: AlwaysScrollableScrollPhysics(),
          ),
          slivers: [
            // Header row: back + logo in place of the full PBHeader.
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 20, 8),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      icon: Icon(Icons.chevron_left_rounded, size: 28, color: pb.ink),
                    ),
                    const Spacer(),
                    const LangToggle(),
                    const SizedBox(width: 8),
                    const ThemeGlyph(),
                  ],
                ),
              ),
            ),

            // Avatar hero card
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: _HeroCard(
                  name: settings.guideName,
                  tagline: settings.taglineFor(locale).isEmpty
                      ? s.aboutRoleTagline
                      : settings.taglineFor(locale),
                  avatarUrl: settings.guideAvatarUrl,
                ),
              ),
            ),

            // Bio
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: pb.bgElev,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: pb.hairline),
                  ),
                  child: Text(
                    settings.bioFor(locale),
                    style: TextStyle(
                      fontSize: 14,
                      color: pb.ink2,
                      height: 1.6,
                    ),
                  ),
                ),
              ),
            ),

            // Book CTA. The booking URL is managed in the backoffice
            // (about_section.booking_url). If blank, the button shows a
            // short toast so the admin remembers to fill it in.
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 40),
                child: Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    onTap: () {
                      final url = settings.bookingUrl;
                      if (url.isNotEmpty) {
                        Launchers.open(url);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(s.bookingNotSet),
                            duration: const Duration(seconds: 3),
                          ),
                        );
                      }
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        gradient: PBBrand.gradient,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x52B8283F),
                            blurRadius: 30,
                            offset: Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 16, color: Colors.white),
                          const SizedBox(width: 10),
                          Text(
                            s.bookAWalk,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  final String name;
  final String tagline;
  final String? avatarUrl;

  const _HeroCard({
    required this.name,
    required this.tagline,
    required this.avatarUrl,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
        // SizedBox(width: double.infinity) forces the card to take the full
        // width its parent allows. Without it, the inner Column shrinks to
        // its intrinsic content width and drags the whole card with it —
        // which is why the avatar previously read as left-of-center and the
        // soft pink wash didn't reach the right edge.
        child: SizedBox(
          width: double.infinity,
          child: Container(
            padding: const EdgeInsets.fromLTRB(22, 26, 22, 26),
            decoration: BoxDecoration(
              // Soft brand wash painted directly on the card so it always
              // covers the full width, layered over the surface tint.
              color: pb.surface,
              gradient: PBBrand.gradientSoft,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: pb.surfaceBorder),
              boxShadow: pb.glassShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Avatar. Aligned to topCenter so portraits keep the face in
                // frame instead of centering on the chin/torso.
                Container(
                  width: 112,
                  height: 112,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: PBBrand.gradient,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x59B8283F),
                        blurRadius: 30,
                        offset: Offset(0, 10),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: (avatarUrl != null && avatarUrl!.isNotEmpty)
                      ? ClipOval(
                          child: SizedBox(
                            width: 112,
                            height: 112,
                            child: PBImage(
                              url: avatarUrl!,
                              fit: BoxFit.cover,
                              alignment: Alignment.topCenter,
                            ),
                          ),
                        )
                      : Text(
                          name.isNotEmpty ? name[0].toUpperCase() : 'V',
                          style: Theme.of(context)
                              .textTheme
                              .displayMedium
                              ?.copyWith(
                                color: Colors.white,
                                fontSize: 40,
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                ),
                const SizedBox(height: 14),
                Text(
                  name,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                        fontSize: 28,
                        letterSpacing: -0.42,
                        color: pb.ink,
                      ),
                ),
                const SizedBox(height: 6),
                // Fraunces italic for the tagline — copy from displayMedium
                // (which uses Fraunces via GoogleFonts) so the family sticks.
                Text(
                  tagline,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                        fontSize: 13,
                        color: pb.ink2,
                        fontStyle: FontStyle.italic,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 0,
                        height: 1.3,
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
