import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/providers.dart';
import '../push.dart';
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
class HomeShell extends ConsumerStatefulWidget {
  const HomeShell({super.key});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  bool _pushTapHandlersAttached = false;

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final activeIndex = ref.watch(activeTabIndexProvider);
    final active = PBTab.values[activeIndex.clamp(0, PBTab.values.length - 1)];

    // One-time: hook FCM tap callbacks into our Riverpod ref so a tap
    // on a notification can flip the active tab. Idempotent — guarded by
    // the bool so a rebuild doesn't double-subscribe.
    if (!_pushTapHandlersAttached) {
      _pushTapHandlersAttached = true;
      PushService.instance.attachTapHandlers(ref);
    }

    // Re-register the device token whenever the user changes language so
    // future broadcasts arrive in their preferred locale.
    ref.listen<String>(localeProvider, (prev, next) {
      if (prev != next) PushService.instance.init(locale: next);
    });

    // A push tap (or an in-app shortcut) parks an index in the pending
    // provider; we drain it into the active tab and clear it back to null
    // so the same tap doesn't keep re-firing on rebuild.
    ref.listen<int?>(pendingTabRequestProvider, (_, next) {
      if (next == null) return;
      ref.read(activeTabIndexProvider.notifier).state = next;
      Future.microtask(
        () => ref.read(pendingTabRequestProvider.notifier).state = null,
      );
    });

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
              onTap: (t) => ref.read(activeTabIndexProvider.notifier).state =
                  PBTab.values.indexOf(t),
            ),
          ),
        ],
      ),
    );
  }
}
