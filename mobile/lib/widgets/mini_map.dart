import 'package:flutter/material.dart';

import '../supabase_client.dart';
import '../theme/palette.dart';
import 'image.dart';

/// Small map preview for detail screens.
///
/// Uses the Mapbox Static Images API when a token + coordinates are available
/// (real map with a brand-colored pin), otherwise falls back to a striped
/// placeholder so the layout stays intact on empty data.
class MiniMap extends StatelessWidget {
  final double? latitude;
  final double? longitude;
  final double height;

  const MiniMap({
    super.key,
    required this.latitude,
    required this.longitude,
    this.height = 140,
  });

  @override
  Widget build(BuildContext context) {
    final pb = context.pb;
    final hasCoords = latitude != null && longitude != null;
    final token = mapboxToken;

    Widget content;
    if (!hasCoords || token.isEmpty) {
      content = _FallbackMap(isDark: pb.isDark);
    } else {
      final style = pb.isDark ? 'dark-v11' : 'streets-v12';
      // Brand crimson pin; 2x for retina on phones.
      final url = 'https://api.mapbox.com/styles/v1/mapbox/$style/static/'
          'pin-l+b8283f($longitude,$latitude)/'
          '$longitude,$latitude,14,0/600x280@2x?access_token=$token';
      content = PBImage(url: url, placeholder: _FallbackMap(isDark: pb.isDark));
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: SizedBox(
        height: height,
        width: double.infinity,
        child: DecoratedBox(
          decoration: BoxDecoration(
            border: Border.all(color: pb.hairline),
            borderRadius: BorderRadius.circular(16),
          ),
          child: content,
        ),
      ),
    );
  }
}

class _FallbackMap extends StatelessWidget {
  final bool isDark;
  const _FallbackMap({required this.isDark});

  @override
  Widget build(BuildContext context) {
    final land = isDark ? const Color(0xFF241C18) : const Color(0xFFF0EAE0);
    final water = isDark ? const Color(0xFF1A1512) : const Color(0xFFDCE7EA);

    return Container(
      color: land,
      child: CustomPaint(
        painter: _MapPainter(water: water, isDark: isDark),
        child: const Center(
          child: Icon(
            Icons.place_rounded,
            size: 32,
            color: PBBrand.red,
          ),
        ),
      ),
    );
  }
}

class _MapPainter extends CustomPainter {
  final Color water;
  final bool isDark;
  _MapPainter({required this.water, required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final stroke = Paint()
      ..color = (isDark ? Colors.white : Colors.black).withOpacity(0.07)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    // "river"
    final river = Path()
      ..moveTo(-10, h * 0.65)
      ..quadraticBezierTo(w * 0.2, h * 0.5, w * 0.4, h * 0.6)
      ..quadraticBezierTo(w * 0.6, h * 0.7, w * 0.83, h * 0.52)
      ..quadraticBezierTo(w * 0.95, h * 0.45, w + 10, h * 0.65)
      ..lineTo(w + 10, h + 10)
      ..lineTo(-10, h + 10)
      ..close();
    canvas.drawPath(river, Paint()..color = water);
    canvas.drawPath(river..close(), stroke);

    // grid of streets
    canvas.drawLine(Offset(0, h * 0.28), Offset(w, h * 0.38), stroke);
    canvas.drawLine(Offset(0, h * 0.14), Offset(w, h * 0.21), stroke);
    canvas.drawLine(Offset(0, h * 0.78), Offset(w, h * 0.86), stroke);
    canvas.drawLine(Offset(w * 0.2, 0), Offset(w * 0.27, h), stroke);
    canvas.drawLine(Offset(w * 0.47, 0), Offset(w * 0.52, h), stroke);
    canvas.drawLine(Offset(w * 0.73, 0), Offset(w * 0.8, h), stroke);
  }

  @override
  bool shouldRepaint(covariant _MapPainter oldDelegate) =>
      oldDelegate.water != water || oldDelegate.isDark != isDark;
}
