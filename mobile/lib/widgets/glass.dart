import 'dart:ui';

import 'package:flutter/material.dart';

import '../theme/palette.dart';

/// Frosted-glass container. Wraps a child in a BackdropFilter + semi-transparent
/// surface tint + border, matching the `theme.surface / surfaceBorder` tokens.
///
/// Emulator warning: heavy stacks of BackdropFilter can stutter on software GPU.
/// Use `blur: 0` as a fallback for cheap cards.
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final BorderRadius borderRadius;
  final double blur;
  final Color? surfaceOverride;
  final Color? borderOverride;
  final List<BoxShadow>? shadow;
  final double borderWidth;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(14),
    this.borderRadius = const BorderRadius.all(Radius.circular(18)),
    this.blur = 20,
    this.surfaceOverride,
    this.borderOverride,
    this.shadow,
    this.borderWidth = 1,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final surface = surfaceOverride ?? pb.surface;
    final border = borderOverride ?? pb.surfaceBorder;

    Widget inner = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: surface,
        borderRadius: borderRadius,
        border: Border.all(color: border, width: borderWidth),
        boxShadow: shadow ?? pb.glassShadow,
      ),
      child: child,
    );

    if (blur > 0) {
      inner = BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: inner,
      );
    }

    return ClipRRect(borderRadius: borderRadius, child: inner);
  }
}

/// Subtle brand-tinted page wash, used as the scaffold background accent.
/// Positioned behind all content — non-interactive.
class PBBackdrop extends StatelessWidget {
  final Widget child;
  const PBBackdrop({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    return Stack(
      children: [
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [pb.skyStart, pb.skyEnd],
              ),
            ),
          ),
        ),
        child,
      ],
    );
  }
}
