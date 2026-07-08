import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonGraph — sparkline port.
/// Source: Figma `- Graph` (12:84746).

class OrigonGraph extends StatelessWidget {
  final List<double> data;
  final double width;
  final double height;
  final Color? color;
  final bool showFill;

  const OrigonGraph({
    super.key,
    required this.data,
    this.width = 120,
    this.height = 40,
    this.color,
    this.showFill = true,
  });

  @override
  Widget build(BuildContext context) {
    if (data.length < 2) return SizedBox(width: width, height: height);
    final trend = data.last - data.first;
    final resolved = color ?? (trend >= 0 ? OrigonColors.green.s600 : OrigonColors.red.s600);
    return SizedBox(
      width: width,
      height: height,
      child: CustomPaint(painter: _GraphPainter(data: data, color: resolved, showFill: showFill)),
    );
  }
}

class _GraphPainter extends CustomPainter {
  final List<double> data;
  final Color color;
  final bool showFill;
  _GraphPainter({required this.data, required this.color, required this.showFill});

  @override
  void paint(Canvas canvas, Size size) {
    double lo = double.infinity, hi = -double.infinity;
    for (final v in data) { if (v < lo) lo = v; if (v > hi) hi = v; }
    if (lo == hi) { lo -= 1; hi += 1; }
    double x(int i) => (i / (data.length - 1)) * size.width;
    double y(double v) => size.height - ((v - lo) / (hi - lo)) * size.height;

    final line = Path()..moveTo(x(0), y(data[0]));
    for (var i = 1; i < data.length; i++) line.lineTo(x(i), y(data[i]));

    if (showFill) {
      final area = Path.from(line)
        ..lineTo(x(data.length - 1), size.height)
        ..lineTo(x(0), size.height)
        ..close();
      canvas.drawPath(area, Paint()..color = color.withOpacity(0.16));
    }
    canvas.drawPath(
      line,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(covariant _GraphPainter old) => old.data != data || old.color != color;
}
