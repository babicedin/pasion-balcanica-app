import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

/// Small wrappers around url_launcher / share_plus so the call sites stay
/// tidy. We intentionally skip `canLaunchUrl` for tel: / https: on Android
/// because it depends on a <queries> manifest entry and frequently returns
/// `false` even when the intent would actually resolve — better to try and
/// swallow any PlatformException than to silently do nothing.
class Launchers {
  Launchers._();

  /// Open the phone dialer pre-filled with [phone]. Silent no-op if the
  /// device has no dialer (iOS Simulator, tablets, etc).
  static Future<void> call(String phone) async {
    final cleaned = phone.replaceAll(RegExp(r'\s+'), '');
    if (cleaned.isEmpty) return;
    final uri = Uri.parse('tel:$cleaned');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } on PlatformException {
      // No dialer / user cancelled — ignore.
    }
  }

  /// Open Google Maps directions to a destination. Uses the universal link
  /// so iOS/Android pick the best handler (native Maps app when available).
  static Future<void> directions({
    required double lat,
    required double lng,
    String? label,
  }) async {
    final uri = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng',
    );
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } on PlatformException {
      await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
    }
  }

  /// Search Google Maps by a free-form address. Used when we only have a
  /// street address (no lat/lng pair).
  static Future<void> directionsToAddress(String address) async {
    if (address.trim().isEmpty) return;
    final uri = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(address)}',
    );
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } on PlatformException {
      await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
    }
  }

  /// Open an arbitrary URL in the user's browser / target app.
  static Future<void> open(String url) async {
    if (url.isEmpty) return;
    final uri = Uri.parse(url);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } on PlatformException {
      await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
    }
  }

  /// Open a video URL inside an in-app browser popup (Android Custom Tabs /
  /// iOS SFSafariViewController). Perfect for YouTube links where we want
  /// the viewer to watch without leaving the app. Falls back to the native
  /// YouTube app / browser if the in-app viewer is unavailable.
  static Future<void> playVideo(String url) async {
    if (url.isEmpty) return;
    final uri = Uri.parse(url);
    try {
      await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
    } on PlatformException {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  /// Share a piece of content through the platform share sheet.
  static Future<void> share({
    required String text,
    String? subject,
  }) async {
    if (text.isEmpty) return;
    await Share.share(text, subject: subject);
  }
}
