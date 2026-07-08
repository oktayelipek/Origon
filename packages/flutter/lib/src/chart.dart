import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonChart — line/area/bar port. Lightweight in-house painter.
/// For heavier interactivity, wrap `charts_flutter` or `fl_chart` and pass
/// Origon token colors as its theme.
/// Source: Figma `- Charts` (12:86299).

enum OrigonChartKind { line, area, bar }

class OrigonChartSeries {
  final String? label;
  final Color? color;
  final List<double> data;
  const OrigonChartSeries({this.label, this.color, required this.data});
}

class OrigonChart extends StatelessWidget {
  final OrigonChartKind kind;
  final List<OrigonChartSeries> series;
  final double width;
  final double height;
  final bool showGrid;

  const OrigonChart({
    super.key,
    this.kind = OrigonChartKind.line,
    required this.series,
    this.width = 320,
    this.height = 160,
    this.showGrid = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    return SizedBox(
      width: width,
      height: height,
      child: CustomPaint(
        painter: _ChartPainter(
          kind: kind,
          series: series,
          showGrid: showGrid,
          defaultColor: theme.semantic.button.primary,
          gridColor: OrigonColors.blueGray.s300,
        ),
      ),
    );
  }
}

class _ChartPainter extends CustomPainter {
  final OrigonChartKind kind;
  final List<OrigonChartSeries> series;
  final bool showGrid;
  final Color defaultColor;
  final Color gridColor;

  _ChartPainter({
    required this.kind, required this.series, required this.showGrid,
    required this.defaultColor, required this.gridColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const padding = EdgeInsets.fromLTRB(8, 12, 12, 8);
    final innerW = size.width - padding.horizontal;
    final innerH = size.height - padding.vertical;
    double lo = double.infinity, hi = -double.infinity;
    var len = 0;
    for (final s in series) {
      len = len < s.data.length ? s.data.length : len;
      for (final v in s.data) { if (v < lo) lo = v; if (v > hi) hi = v; }
    }
    if (lo == hi) { lo -= 1; hi += 1; }
    double x(int i) => padding.left + (i / (len == 1 ? 1 : len - 1)) * innerW;
    double y(double v) => padding.top + innerH - ((v - lo) / (hi - lo)) * innerH;

    if (showGrid) {
      final gridPaint = Paint()..color = gridColor.withOpacity(0.5)..strokeWidth = 1;
      for (final f in [0.25, 0.5, 0.75]) {
        final yy = padding.top + f * innerH;
        canvas.drawLine(Offset(padding.left, yy), Offset(padding.left + innerW, yy), gridPaint);
      }
    }

    for (var si = 0; si < series.length; si++) {
      final s = series[si];
      final color = s.color ?? defaultColor;
      if (kind == OrigonChartKind.bar) {
        final barW = innerW / (s.data.length * series.length) * 0.7;
        for (var i = 0; i < s.data.length; i++) {
          final v = s.data[i];
          final rect = Rect.fromLTWH(
            x(i) - (barW * series.length) / 2 + si * barW,
            v >= 0 ? y(v) : y(0),
            barW,
            (y(v) - y(0)).abs(),
          );
          canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(2)), Paint()..color = color);
        }
        continue;
      }
      final path = Path()..moveTo(x(0), y(s.data[0]));
      for (var i = 1; i < s.data.length; i++) path.lineTo(x(i), y(s.data[i]));
      if (kind == OrigonChartKind.area) {
        final area = Path.from(path)
          ..lineTo(x(s.data.length - 1), padding.top + innerH)
          ..lineTo(x(0), padding.top + innerH)
          ..close();
        canvas.drawPath(area, Paint()..color = color.withOpacity(0.18));
      }
      canvas.drawPath(
        path,
        Paint()..color = color..style = PaintingStyle.stroke..strokeWidth = 2..strokeCap = StrokeCap.round..strokeJoin = StrokeJoin.round,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _ChartPainter old) => old.series != series || old.kind != kind;
}
