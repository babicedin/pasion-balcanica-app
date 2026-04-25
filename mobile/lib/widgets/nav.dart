import 'dart:ui';

import 'package:flutter/material.dart';

import '../l10n/strings.dart';
import '../theme/palette.dart';

/// Tab identity for the floating nav — maps 1:1 with [HomeShell] pages.
enum PBTab { home, places, food, shopping, numbers, review }

/// Floating liquid-glass bottom nav.
///
/// - Pill sits 14px above the safe bottom.
/// - Active tab swells a little and shows its label inside a gradient chip.
/// - Inactive tabs are icon-only.
/// - Uses BackdropFilter for the real frosted look.
class PBFloatingNav extends StatelessWidget {
  final PBTab active;
  final String locale;
  final ValueChanged<PBTab> onTap;

  const PBFloatingNav({
    super.key,
    required this.active,
    required this.locale,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final s = S.of(locale);
    final bottom = MediaQuery.of(context).padding.bottom;

    final items = <_NavItem>[
      _NavItem(PBTab.home, Icons.home_rounded, Icons.home_outlined, s.tabHome),
      _NavItem(PBTab.places, Icons.place_rounded, Icons.place_outlined, s.tabPlaces),
      _NavItem(PBTab.food, Icons.restaurant_rounded, Icons.restaurant_outlined, s.tabFood),
      _NavItem(PBTab.shopping, Icons.shopping_bag_rounded, Icons.shopping_bag_outlined, s.tabShopping),
      _NavItem(PBTab.numbers, Icons.call_rounded, Icons.call_outlined, s.tabNumbers),
      _NavItem(PBTab.review, Icons.star_rounded, Icons.star_outline_rounded, s.tabReview),
    ];

    return Padding(
      // Outer margin: keep the pill clearly inset from the screen edges but
      // give it room to stretch wide enough that 6 tabs don't feel packed.
      padding: EdgeInsets.fromLTRB(10, 0, 10, bottom + 10),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(34),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
            decoration: BoxDecoration(
              color: pb.navGlass,
              borderRadius: BorderRadius.circular(34),
              border: Border.all(color: pb.surfaceBorder, width: 1),
              boxShadow: [
                BoxShadow(
                  color: pb.isDark
                      ? const Color(0x73000000)
                      : const Color(0x1F1A1512),
                  blurRadius: 40,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            // Stretch the row across the full available width and give each
            // tab an equal slice via Expanded. With 6 tabs on a typical
            // ~360px Android viewport this yields ~55-58px per cell — wide
            // enough that the active gradient pill (with its label) doesn't
            // feel cramped, and inactive icons stay comfortably centered.
            child: Row(
              children: [
                for (final it in items)
                  Expanded(
                    child: _NavButton(
                      item: it,
                      active: it.tab == active,
                      onTap: () => onTap(it.tab),
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

class _NavItem {
  final PBTab tab;
  final IconData filled;
  final IconData outlined;
  final String label;
  const _NavItem(this.tab, this.filled, this.outlined, this.label);
}

class _NavButton extends StatelessWidget {
  final _NavItem item;
  final bool active;
  final VoidCallback onTap;

  const _NavButton({
    required this.item,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 240),
          curve: Curves.easeOutCubic,
          // Each cell takes the full 1/N width given by the parent's Expanded.
          // We add a tiny inset so the active gradient pill has visual breathing
          // room from its neighbours rather than touching them.
          margin: const EdgeInsets.symmetric(horizontal: 2),
          padding: const EdgeInsets.symmetric(vertical: 8),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: active ? PBBrand.gradient : null,
            borderRadius: BorderRadius.circular(24),
            boxShadow: active
                ? const [
                    BoxShadow(
                      color: Color(0x59B8283F),
                      blurRadius: 14,
                      offset: Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                active ? item.filled : item.outlined,
                size: 20,
                color: active ? Colors.white : pb.ink2,
              ),
              if (active) ...[
                const SizedBox(height: 2),
                Text(
                  item.label,
                  maxLines: 1,
                  overflow: TextOverflow.fade,
                  softWrap: false,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                    letterSpacing: 0.1,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
