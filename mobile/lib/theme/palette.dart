import 'package:flutter/material.dart';

/// Pasión Balcánica brand palette — derived from the logo gradient.
///
/// The app has two modes (light + dark) with distinct tokens for surfaces,
/// glass, inks, and hairlines. Keep these aligned with new-mobile/app-data.jsx.
class PBBrand {
  PBBrand._();

  static const Color red = Color(0xFFB8283F);
  static const Color magenta = Color(0xFF7A2159);
  static const Color indigo = Color(0xFF3F2770);

  static const LinearGradient gradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [red, magenta, indigo],
    stops: [0.0, 0.55, 1.0],
  );

  /// Very subtle wash of the brand gradient — for icon tiles and backgrounds.
  static LinearGradient get gradientSoft => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          red.withOpacity(0.12),
          magenta.withOpacity(0.10),
          indigo.withOpacity(0.12),
        ],
        stops: const [0.0, 0.55, 1.0],
      );
}

/// Token set for one theme mode.
///
/// Access from widgets via `Theme.of(context).extension<PBPalette>()!` or the
/// shortcut `context.pb`.
@immutable
class PBPalette extends ThemeExtension<PBPalette> {
  final Color bg;
  final Color bgElev;
  final Color surface;
  final Color surfaceBorder;
  final Color ink;
  final Color ink2;
  final Color ink3;
  final Color hairline;
  final Color navGlass;
  final Color chipBg;
  final Color skyStart;
  final Color skyEnd;
  final List<BoxShadow> glassShadow;
  final bool isDark;

  const PBPalette({
    required this.bg,
    required this.bgElev,
    required this.surface,
    required this.surfaceBorder,
    required this.ink,
    required this.ink2,
    required this.ink3,
    required this.hairline,
    required this.navGlass,
    required this.chipBg,
    required this.skyStart,
    required this.skyEnd,
    required this.glassShadow,
    required this.isDark,
  });

  static const PBPalette light = PBPalette(
    bg: Color(0xFFFAFAF7),
    bgElev: Color(0xFFFFFFFF),
    surface: Color(0xB8FFFFFF), // 0.72 alpha
    surfaceBorder: Color(0x141A1512), // 0.08
    ink: Color(0xFF1A1512),
    ink2: Color(0xFF4A3F38),
    ink3: Color(0xFF8B7F75),
    hairline: Color(0x141A1512),
    navGlass: Color(0xC7FFFFFF), // 0.78
    chipBg: Color(0x0D1A1512), // 0.05
    skyStart: Color(0xFFF5E9D8),
    skyEnd: Color(0xFFFAFAF7),
    glassShadow: [
      BoxShadow(
        color: Color(0x141A1512),
        blurRadius: 32,
        offset: Offset(0, 8),
      ),
      BoxShadow(
        color: Color(0x0A1A1512),
        blurRadius: 2,
        offset: Offset(0, 1),
      ),
    ],
    isDark: false,
  );

  static const PBPalette dark = PBPalette(
    bg: Color(0xFF14100E),
    bgElev: Color(0xFF1E1814),
    surface: Color(0x8C241C18), // 0.55
    surfaceBorder: Color(0x14FFF0E6),
    ink: Color(0xFFF5EFE8),
    ink2: Color(0xFFC9BDB2),
    ink3: Color(0xFF8A7F75),
    hairline: Color(0x14FFF0E6),
    navGlass: Color(0xB81E1814), // 0.72
    chipBg: Color(0x0FFFF0E6), // 0.06
    skyStart: Color(0xFF2A1E1C),
    skyEnd: Color(0xFF14100E),
    glassShadow: [
      BoxShadow(
        color: Color(0x66000000),
        blurRadius: 32,
        offset: Offset(0, 8),
      ),
      BoxShadow(
        color: Color(0x4D000000),
        blurRadius: 2,
        offset: Offset(0, 1),
      ),
    ],
    isDark: true,
  );

  @override
  PBPalette copyWith({
    Color? bg,
    Color? bgElev,
    Color? surface,
    Color? surfaceBorder,
    Color? ink,
    Color? ink2,
    Color? ink3,
    Color? hairline,
    Color? navGlass,
    Color? chipBg,
    Color? skyStart,
    Color? skyEnd,
    List<BoxShadow>? glassShadow,
    bool? isDark,
  }) {
    return PBPalette(
      bg: bg ?? this.bg,
      bgElev: bgElev ?? this.bgElev,
      surface: surface ?? this.surface,
      surfaceBorder: surfaceBorder ?? this.surfaceBorder,
      ink: ink ?? this.ink,
      ink2: ink2 ?? this.ink2,
      ink3: ink3 ?? this.ink3,
      hairline: hairline ?? this.hairline,
      navGlass: navGlass ?? this.navGlass,
      chipBg: chipBg ?? this.chipBg,
      skyStart: skyStart ?? this.skyStart,
      skyEnd: skyEnd ?? this.skyEnd,
      glassShadow: glassShadow ?? this.glassShadow,
      isDark: isDark ?? this.isDark,
    );
  }

  @override
  PBPalette lerp(ThemeExtension<PBPalette>? other, double t) {
    if (other is! PBPalette) return this;
    return PBPalette(
      bg: Color.lerp(bg, other.bg, t)!,
      bgElev: Color.lerp(bgElev, other.bgElev, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceBorder: Color.lerp(surfaceBorder, other.surfaceBorder, t)!,
      ink: Color.lerp(ink, other.ink, t)!,
      ink2: Color.lerp(ink2, other.ink2, t)!,
      ink3: Color.lerp(ink3, other.ink3, t)!,
      hairline: Color.lerp(hairline, other.hairline, t)!,
      navGlass: Color.lerp(navGlass, other.navGlass, t)!,
      chipBg: Color.lerp(chipBg, other.chipBg, t)!,
      skyStart: Color.lerp(skyStart, other.skyStart, t)!,
      skyEnd: Color.lerp(skyEnd, other.skyEnd, t)!,
      glassShadow: t < 0.5 ? glassShadow : other.glassShadow,
      isDark: t < 0.5 ? isDark : other.isDark,
    );
  }
}

extension PBPaletteX on BuildContext {
  PBPalette get pb => Theme.of(this).extension<PBPalette>()!;
}
