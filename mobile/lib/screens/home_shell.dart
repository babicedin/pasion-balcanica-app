import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/providers.dart';
import '../theme/palette.dart';
import '../widgets/nav.dart';
import 'food_screen.dart';
import 'home_screen.dart';
import 'numbers_screen.dart';
import 'places_screen.dart';
import 'review_screen.dart';
import 'shopping_screen.dart';

/// Root scaffold: holds the 5 tabs and the floating glass nav.
///
/// Uses IndexedStack so each tab keeps its scroll position when you switch
/// away and back — same feel as native iOS/Android tab bars.
///
/// The nav is positioned manually inside a Stack at the bottom of the
/// screen rather than being given to Scaffold.bottomNavigationBar — this
/// guarantees it hugs the bottom edge, regardless of screen size or
/// intrinsic-height quirks.
class HomeShell extends ConsumerWidget {
  const HomeShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pb = context.pb;
    final locale = ref.watch(localeProvider);
    final activeIndex = ref.watch(activeTabIndexProvider);
    final active = PBTab.values[activeIndex.clamp(0, PBTab.values.length - 1)];

    return Scaffold(
      backgroundColor: pb.bg,
      body: Stack(
        children: [
          Positioned.fill(
            child: IndexedStack(
              index: activeIndex,
              children: const [
                HomeScreen(),
                PlacesScreen(),
                FoodScreen(),
                ShoppingScreen(),
                NumbersScreen(),
                ReviewScreen(),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: PBFloatingNav(
              active: active,
              locale: locale,
              onTap: (t) => ref.read(activeTabIndexProvider.notifier).state =
                  PBTab.values.indexOf(t),
            ),
          ),
        ],
      ),
    );
  }
}
