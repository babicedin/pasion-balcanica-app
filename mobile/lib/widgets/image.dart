import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../theme/palette.dart';

/// Cached network image with palette-aware placeholder and error states.
///
/// Empty URLs short-circuit to a plain tinted container — the guide's CMS can
/// legitimately have a Place with no hero photo yet.
class PBImage extends StatelessWidget {
  final String url;
  final BoxFit fit;
  final Alignment alignment;
  final Widget? placeholder;

  const PBImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.alignment = Alignment.center,
    this.placeholder,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    if (url.isEmpty) {
      return placeholder ?? Container(color: pb.chipBg);
    }
    return CachedNetworkImage(
      imageUrl: url,
      fit: fit,
      alignment: alignment,
      fadeInDuration: const Duration(milliseconds: 200),
      placeholder: (_, __) => placeholder ?? Container(color: pb.chipBg),
      errorWidget: (_, __, ___) => Container(
        color: pb.chipBg,
        alignment: Alignment.center,
        child: Icon(Icons.image_outlined, color: pb.ink3, size: 28),
      ),
    );
  }
}
