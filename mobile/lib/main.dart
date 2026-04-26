import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'providers/providers.dart';
import 'push.dart';
import 'screens/home_shell.dart';
import 'supabase_client.dart';
import 'theme/theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load();
  } catch (e) {
    // Keep the shell UI bootable even if `.env` packaging fails in release.
    debugPrint('dotenv load failed: $e');
  }
  try {
    await initSupabase();
  } catch (e) {
    // Non-fatal: app still runs; data providers return empty until init works.
    debugPrint('Supabase init failed: $e');
  }

  // Push notifications. Init is best-effort and never blocks UI; the
  // device's persisted locale is loaded asynchronously by Riverpod, so we
  // pass a sensible default here and let HomeShell re-call init() once
  // the real locale is known.
  unawaited(PushService.instance.init(locale: 'en'));

  // Edge-to-edge: lets the app paint behind the gesture/nav bar instead of
  // leaving Android's default black strip there (visible on some Xiaomi/MIUI
  // devices when `systemNavigationBarColor` is transparent without this mode).
  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarDividerColor: Colors.transparent,
      // MIUI / Android 10+ otherwise overlays a translucent scrim on the
      // navigation bar to ensure icon contrast — that scrim is what reads
      // as a "black line" at the bottom of the app.
      systemNavigationBarContrastEnforced: false,
      systemStatusBarContrastEnforced: false,
    ),
  );

  runApp(const ProviderScope(child: PasionBalcanicaApp()));
}

class PasionBalcanicaApp extends ConsumerWidget {
  const PasionBalcanicaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    // Keep the nav/status bar chrome in sync with the active mode so the
    // scaffold background never peeks through edge-to-edge content.
    final isDark = themeMode == ThemeMode.dark;
    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
        statusBarBrightness: isDark ? Brightness.dark : Brightness.light,
        // Transparent so the floating nav bar can sit flush with the gesture
        // area; contrast enforcement disabled to prevent MIUI/Android from
        // re-introducing a black scrim. The scaffold paints `pb.bg` underneath.
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarDividerColor: Colors.transparent,
        systemNavigationBarContrastEnforced: false,
        systemNavigationBarIconBrightness:
            isDark ? Brightness.light : Brightness.dark,
      ),
    );

    return MaterialApp(
      title: 'Pasión Balcánica',
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: buildPBTheme(Brightness.light),
      darkTheme: buildPBTheme(Brightness.dark),
      home: const HomeShell(),
    );
  }
}
