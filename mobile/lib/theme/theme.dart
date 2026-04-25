import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'palette.dart';

/// Builds the ThemeData for a given Brightness, wiring the PB palette + fonts.
///
/// Display: Fraunces (serif, titles and accents)
/// UI: Inter (sans, body and controls)
ThemeData buildPBTheme(Brightness brightness) {
  final pb = brightness == Brightness.light ? PBPalette.light : PBPalette.dark;

  final display = GoogleFonts.fraunces(color: pb.ink);
  final body = GoogleFonts.inter(color: pb.ink);

  // TextTheme: displayLarge..titleLarge use Fraunces; bodyLarge..labelSmall use Inter.
  final textTheme = TextTheme(
    // Note on `height`: Fraunces (especially in italic) has descenders on j/g/y
    // that extend below the alphabetic baseline. Tight line heights (1.0–1.1)
    // visibly clip those tails on Android. 1.2–1.25 gives the descenders room
    // without making single-line headlines feel airy.
    displayLarge: display.copyWith(fontSize: 40, fontWeight: FontWeight.w500, letterSpacing: -0.6, height: 1.2),
    displayMedium: display.copyWith(fontSize: 32, fontWeight: FontWeight.w500, letterSpacing: -0.5, height: 1.2),
    displaySmall: display.copyWith(fontSize: 28, fontWeight: FontWeight.w500, letterSpacing: -0.4, height: 1.2),
    headlineLarge: display.copyWith(fontSize: 24, fontWeight: FontWeight.w600, height: 1.25),
    headlineMedium: display.copyWith(fontSize: 20, fontWeight: FontWeight.w500, height: 1.25),
    headlineSmall: display.copyWith(fontSize: 17, fontWeight: FontWeight.w600, height: 1.3),
    titleLarge: display.copyWith(fontSize: 17, fontWeight: FontWeight.w600),
    titleMedium: body.copyWith(fontSize: 15, fontWeight: FontWeight.w600),
    titleSmall: body.copyWith(fontSize: 13, fontWeight: FontWeight.w600),
    bodyLarge: body.copyWith(fontSize: 15, color: pb.ink2, height: 1.5),
    bodyMedium: body.copyWith(fontSize: 14, color: pb.ink2, height: 1.4),
    bodySmall: body.copyWith(fontSize: 12, color: pb.ink3, height: 1.4),
    labelLarge: body.copyWith(fontSize: 13, fontWeight: FontWeight.w600),
    labelMedium: body.copyWith(fontSize: 12, fontWeight: FontWeight.w500),
    labelSmall: body.copyWith(fontSize: 11, fontWeight: FontWeight.w600, color: pb.ink3, letterSpacing: 0.5),
  );

  final base = brightness == Brightness.light ? ThemeData.light() : ThemeData.dark();

  return base.copyWith(
    brightness: brightness,
    scaffoldBackgroundColor: pb.bg,
    canvasColor: pb.bg,
    primaryColor: PBBrand.red,
    colorScheme: (brightness == Brightness.light
            ? const ColorScheme.light()
            : const ColorScheme.dark())
        .copyWith(
      primary: PBBrand.red,
      secondary: PBBrand.magenta,
      surface: pb.bgElev,
      onSurface: pb.ink,
      onPrimary: Colors.white,
    ),
    textTheme: textTheme,
    iconTheme: IconThemeData(color: pb.ink2, size: 20),
    dividerColor: pb.hairline,
    splashFactory: InkSparkle.splashFactory,
    extensions: <ThemeExtension<dynamic>>[pb],
    pageTransitionsTheme: const PageTransitionsTheme(
      builders: {
        TargetPlatform.android: CupertinoPageTransitionsBuilder(),
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      },
    ),
  );
}
