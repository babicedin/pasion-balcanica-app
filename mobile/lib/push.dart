import 'dart:io' show Platform;

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'supabase_client.dart';

/// One-shot intent surfaced when a notification taps in. The HomeShell
/// listens to this and switches tabs accordingly. We model it as a single
/// optional value rather than a stream so we don't over-engineer for the
/// only deep-link target we actually have today (Review).
final pendingTabRequestProvider = StateProvider<int?>((_) => null);

/// Background isolate handler. Must be a top-level (or static) function so
/// Flutter can register its entry point — capturing instance state would
/// stop the isolate from being constructible.
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Firebase has to be initialised again in the background isolate. The
  // foreground init has already created the default app, so this is a
  // no-op when the app is warm — but the OS may spawn a fresh isolate
  // when the app is fully terminated.
  await Firebase.initializeApp();
  // We don't do any work here for now: the system tray will display the
  // notification automatically (FCM 'notification' payload). When we wire
  // up data-only payloads later this is where the local-notif show logic
  // would go.
}

/// Idempotent push setup. Safe to call from main() before the first
/// runApp(); also safe to call again after locale changes (the token
/// upsert simply rewrites locale + last_seen_at).
class PushService {
  PushService._();

  static final instance = PushService._();

  bool _initialised = false;
  String? _cachedToken;
  String _currentLocale = 'en';

  /// Wire up Firebase, request permission, fetch + register the FCM
  /// token, and listen for token refreshes. Errors are logged but never
  /// thrown — push is non-critical and must not block app startup.
  Future<void> init({required String locale}) async {
    _currentLocale = locale;
    if (_initialised) {
      // Locale may have changed since first init — re-register so the
      // server has the right copy for localized broadcasts.
      await _registerWithSupabase();
      return;
    }
    _initialised = true;

    try {
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(
        _firebaseMessagingBackgroundHandler,
      );

      final messaging = FirebaseMessaging.instance;

      // On Android 13+ this triggers the runtime POST_NOTIFICATIONS
      // permission prompt. On Android <=12 the framework grants it at
      // install time — the call is a harmless no-op there.
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      _cachedToken = await messaging.getToken();
      if (_cachedToken != null) {
        await _registerWithSupabase();
      }

      messaging.onTokenRefresh.listen((token) async {
        _cachedToken = token;
        await _registerWithSupabase();
      });
    } catch (e, st) {
      debugPrint('PushService.init failed: $e\n$st');
    }
  }

  /// Hook taps on push notifications into the rest of the app. Caller is
  /// the WidgetRef holder (HomeShell) so we can flip the active tab.
  ///
  /// Three entry points to handle:
  ///   • foreground: app is in front, message arrives — currently we just
  ///     log it. (No in-app banner today; the OS doesn't show one for
  ///     foreground notifications.)
  ///   • background: app is alive but not focused, user taps the tray.
  ///   • terminated: app is fully cold, user taps the tray.
  void attachTapHandlers(WidgetRef ref) {
    FirebaseMessaging.instance
        .getInitialMessage()
        .then((m) => _route(ref, m, source: 'cold-launch'));

    FirebaseMessaging.onMessageOpenedApp.listen(
      (m) => _route(ref, m, source: 'tap'),
    );

    FirebaseMessaging.onMessage.listen((m) {
      // Foreground arrival — no-op for now beyond logging.
      debugPrint('Push (foreground): ${m.notification?.title}');
    });
  }

  void _route(WidgetRef ref, RemoteMessage? message, {required String source}) {
    if (message == null) return;
    final tab = message.data['tab'];
    if (tab == null) return;

    debugPrint('Push tap ($source): tab=$tab');

    // Index must match HomeShell.IndexedStack child order:
    // 0:home 1:places 2:food 3:shopping 4:numbers 5:review
    const map = {
      'home': 0,
      'places': 1,
      'food': 2,
      'shopping': 3,
      'numbers': 4,
      'review': 5,
    };
    final idx = map[tab];
    if (idx != null) {
      ref.read(pendingTabRequestProvider.notifier).state = idx;
    }
  }

  Future<void> _registerWithSupabase() async {
    final token = _cachedToken;
    if (token == null) return;
    try {
      final platform = Platform.isIOS ? 'ios' : 'android';
      // Defensive: locale may be 'es-AR' or 'en_US' — RPC only accepts
      // the bare 'en' / 'es' forms (see CHECK constraint).
      final normalized = _currentLocale.startsWith('es') ? 'es' : 'en';
      await supabase.rpc(
        'register_device_token',
        params: {
          'p_token': token,
          'p_platform': platform,
          'p_locale': normalized,
        },
      );
    } catch (e) {
      debugPrint('PushService.register failed: $e');
    }
  }
}
