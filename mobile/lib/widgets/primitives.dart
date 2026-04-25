import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/providers.dart';
import '../theme/palette.dart';

/// Small, all-caps kicker text used above titles.
class Kicker extends StatelessWidget {
  final String text;
  final Color? color;
  const Kicker(this.text, {super.key, this.color});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Text(
      text,
      style: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 1,
        color: color ?? pb.ink3,
      ),
    );
  }
}

/// Gradient-filled text (approximation via ShaderMask).
class GradientText extends StatelessWidget {
  final String text;
  final TextStyle style;
  const GradientText(this.text, {super.key, required this.style});

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (bounds) => PBBrand.gradient.createShader(
        Rect.fromLTWH(0, 0, bounds.width, bounds.height),
      ),
      blendMode: BlendMode.srcIn,
      child: Text(text, style: style.copyWith(color: Colors.white)),
    );
  }
}

/// Page headline composed of plain + italic-gradient + optional plain segments.
///
/// Example: `AccentHeadline(pre: 'Places to ', accent: 'visit')` renders
/// "Places to visit" where "visit" is Fraunces italic painted with the brand
/// gradient. Matches the Fraunces 30/-0.015em spec from the design canvas.
class AccentHeadline extends StatelessWidget {
  final String pre;
  final String accent;
  final String? post;
  final double fontSize;
  final double letterSpacing;

  const AccentHeadline({
    super.key,
    required this.pre,
    required this.accent,
    this.post,
    this.fontSize = 30,
    this.letterSpacing = -0.45,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    // 1.2 instead of 1.05 to keep the italic Fraunces descender (e.g. the
    // "j" in "Sarajevo") from being clipped by the line box on Android.
    final base = Theme.of(context).textTheme.displayMedium!.copyWith(
          fontSize: fontSize,
          height: 1.2,
          letterSpacing: letterSpacing,
          fontWeight: FontWeight.w500,
          color: pb.ink,
        );

    return Text.rich(
      TextSpan(
        style: base,
        children: [
          TextSpan(text: pre),
          WidgetSpan(
            alignment: PlaceholderAlignment.baseline,
            baseline: TextBaseline.alphabetic,
            child: ShaderMask(
              shaderCallback: (b) => PBBrand.gradient.createShader(
                Rect.fromLTWH(0, 0, b.width, b.height),
              ),
              blendMode: BlendMode.srcIn,
              // Container with right padding sits *inside* the ShaderMask so
              // the mask's bounds (and therefore the gradient shader rect +
              // clip rect) widen to include the trailing italic overhang.
              // Fraunces italic glyphs (t/s/w/o/v) extend past their advance
              // width on the right; without this pad, the last letter
              // visibly gets cut off because the shader has no canvas there.
              child: Container(
                padding: EdgeInsets.only(right: fontSize * 0.18),
                child: Text(
                  accent,
                  style: base.copyWith(
                    fontStyle: FontStyle.italic,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
          if (post != null) TextSpan(text: post),
        ],
      ),
    );
  }
}

/// Solid-color gradient pill, used for primary CTAs.
class GradientPill extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final VoidCallback? onTap;
  final List<BoxShadow>? shadow;

  const GradientPill({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    this.radius = 999,
    this.onTap,
    this.shadow,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            gradient: PBBrand.gradient,
            borderRadius: BorderRadius.circular(radius),
            boxShadow: shadow ??
                [
                  const BoxShadow(
                    color: Color(0x59B8283F),
                    blurRadius: 14,
                    offset: Offset(0, 4),
                  ),
                ],
          ),
          child: DefaultTextStyle.merge(
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
            child: IconTheme.merge(
              data: const IconThemeData(color: Colors.white, size: 14),
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}

/// Primary / secondary action button used in detail screens.
class ActionBtn extends StatelessWidget {
  final Widget icon;
  final String label;
  final bool primary;
  final VoidCallback? onTap;

  const ActionBtn({
    super.key,
    required this.icon,
    required this.label,
    this.primary = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;

    final child = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          IconTheme.merge(
            data: IconThemeData(
              color: primary ? Colors.white : pb.ink,
              size: 14,
            ),
            child: icon,
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: primary ? Colors.white : pb.ink,
            ),
          ),
        ],
      ),
    );

    return Expanded(
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            decoration: BoxDecoration(
              gradient: primary ? PBBrand.gradient : null,
              color: primary ? null : pb.chipBg,
              borderRadius: BorderRadius.circular(14),
              border: primary
                  ? null
                  : Border.all(color: pb.hairline, width: 1),
              boxShadow: primary
                  ? const [
                      BoxShadow(
                        color: Color(0x4DB8283F),
                        blurRadius: 18,
                        offset: Offset(0, 6),
                      ),
                    ]
                  : null,
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Frosted round icon button — used as top controls on hero images.
class CircleBtn extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;

  const CircleBtn({super.key, required this.child, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.35),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white.withOpacity(0.2)),
          ),
          child: Center(child: child),
        ),
      ),
    );
  }
}

/// Category filter chip (active = gradient, inactive = subtle surface).
class FilterChipPB extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback? onTap;

  const FilterChipPB({
    super.key,
    required this.label,
    required this.active,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            gradient: active ? PBBrand.gradient : null,
            color: active ? null : pb.chipBg,
            borderRadius: BorderRadius.circular(999),
            border: active
                ? null
                : Border.all(color: pb.hairline, width: 1),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: active ? Colors.white : pb.ink2,
            ),
          ),
        ),
      ),
    );
  }
}

/// Small inline badge showing photo/video count next to a card title.
class MediaBadge extends StatelessWidget {
  final IconData icon;
  final int count;
  const MediaBadge({super.key, required this.icon, required this.count});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: pb.ink3),
        const SizedBox(width: 4),
        Text(
          '$count',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: pb.ink3,
          ),
        ),
      ],
    );
  }
}

/// Uppercase, letter-spaced section header inside detail sheets.
class SectionHeader extends StatelessWidget {
  final String text;
  const SectionHeader(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: pb.ink3,
        ),
      ),
    );
  }
}

/// EN/ES language pill toggle. Active side is an opaque inner chip.
class LangToggle extends ConsumerWidget {
  const LangToggle({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pb = context.pb;
    final locale = ref.watch(localeProvider);

    Widget tile(String label, String code) {
      final active = locale == code;
      return GestureDetector(
        onTap: () => ref.read(localeProvider.notifier).setLocale(code),
        behavior: HitTestBehavior.opaque,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: active
                ? (pb.isDark ? pb.bgElev : Colors.white)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(999),
            boxShadow: active
                ? const [
                    BoxShadow(
                      color: Color(0x1F000000),
                      blurRadius: 3,
                      offset: Offset(0, 1),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: active ? pb.ink : pb.ink2,
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: pb.chipBg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: pb.hairline, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [tile('EN', 'en'), tile('ES', 'es')],
      ),
    );
  }
}

/// Light/dark mode toggle glyph (sun/moon).
class ThemeGlyph extends ConsumerWidget {
  const ThemeGlyph({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pb = context.pb;
    return GestureDetector(
      onTap: () => ref.read(themeModeProvider.notifier).toggle(),
      behavior: HitTestBehavior.opaque,
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: pb.chipBg,
          shape: BoxShape.circle,
          border: Border.all(color: pb.hairline, width: 1),
        ),
        child: Icon(
          pb.isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
          size: 16,
          color: pb.ink,
        ),
      ),
    );
  }
}

/// Header bar: logo on the left, lang + theme toggles on the right.
class PBHeader extends StatelessWidget {
  const PBHeader({super.key});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 14),
      child: Row(
        children: [
          // Logo — brighten slightly in dark mode so gradient stays readable.
          Flexible(
            child: ColorFiltered(
              colorFilter: pb.isDark
                  ? const ColorFilter.matrix([
                      1.15, 0, 0, 0, 0,
                      0, 1.15, 0, 0, 0,
                      0, 0, 1.15, 0, 0,
                      0, 0, 0, 1, 0,
                    ])
                  : const ColorFilter.mode(Colors.transparent, BlendMode.dst),
              child: Image.asset(
                'assets/logo.png',
                height: 32,
                fit: BoxFit.contain,
                alignment: Alignment.centerLeft,
              ),
            ),
          ),
          const Spacer(),
          const LangToggle(),
          const SizedBox(width: 8),
          const ThemeGlyph(),
        ],
      ),
    );
  }
}
