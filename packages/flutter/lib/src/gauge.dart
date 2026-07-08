import 'dart:math';
import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonGauge — port of the React `<Gauge>`.
/// Source: Figma `- Gauge` (12:84862).

enum OrigonGaugeTone { neutral, success, warning, danger, brand }

class OrigonGauge extends StatelessWidget {
  final double value;
  final double size;
  final OrigonGaugeTone tone;
  final bool showLabel;
  final Widget? label;

  const OrigonGauge({
    super.key,
    required this.value,
    this.size = 44,
    this.tone = OrigonGaugeTone.neutral,
    this.showLabel = true,
    this.label,
  });

  Color _colorFor(OrigonThemeData theme) {
    switch (tone) {
      case OrigonGaugeTone.neutral: return OrigonColors.blueGray.s500;
      case OrigonGaugeTone.success: return OrigonColors.green.s600;
      case OrigonGaugeTone.warning: return OrigonColors.amber.s500;
      case OrigonGaugeTone.danger:  return OrigonColors.red.s600;
      case OrigonGaugeTone.brand:   return theme.semantic.button.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final color = _colorFor(theme);
    final clamped = value.clamp(0.0, 100.0);
    final stroke = max(2.0, size / 12);
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CustomPaint(
            size: Size(size, size),
            painter: _GaugePainter(
              progress: clamped / 100.0,
              color: color,
              track: OrigonColors.blueGray.s300,
              stroke: stroke,
            ),
          ),
          if (showLabel)
            label ??
                Text(
                  '%${clamped.round()}',
                  style: TextStyle(
                    color: color,
                    fontFamily: OrigonFont.primary,
                    fontSize: max(9, size / 4),
                    fontWeight: OrigonFont.medium,
                    height: 1,
                  ),
                ),
        ],
      ),
    );
  }
}

class _GaugePainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color track;
  final double stroke;

  _GaugePainter({required this.progress, required this.color, required this.track, required this.stroke});

  @override
  void paint(Canvas canvas, Size size) {
    final r = (size.width - stroke) / 2;
    final center = Offset(size.width / 2, size.height / 2);
    final rect = Rect.fromCircle(center: center, radius: r);
    final trackPaint = Paint()..color = track..style = PaintingStyle.stroke..strokeWidth = stroke;
    canvas.drawCircle(center, r, trackPaint);
    final arcPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(rect, -pi / 2, 2 * pi * progress, false, arcPaint);
  }

  @override
  bool shouldRepaint(covariant _GaugePainter old) => old.progress != progress || old.color != color;
}
