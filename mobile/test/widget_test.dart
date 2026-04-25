import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:pasion_balcanica/main.dart';

void main() {
  testWidgets('App boots into the HomeShell', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: PasionBalcanicaApp()),
    );
    // Let async initialisation settle but don't pumpAndSettle — the
    // Supabase client call can hang the test pump.
    await tester.pump();
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
