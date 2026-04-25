import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Convenience getter so screens don't need to import supabase_flutter directly.
SupabaseClient get supabase => Supabase.instance.client;

/// Mapbox public token (pk.*) loaded from .env. Used for Static Images API.
String get mapboxToken => dotenv.env['MAPBOX_TOKEN'] ?? '';

/// Initialize Supabase. Must be awaited before the app is mounted.
Future<void> initSupabase() async {
  final url = dotenv.env['SUPABASE_URL'];
  final anonKey = dotenv.env['SUPABASE_PUBLISHABLE_KEY'];
  if (url == null || anonKey == null) {
    throw StateError(
      'Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env',
    );
  }
  await Supabase.initialize(url: url, anonKey: anonKey);
}
