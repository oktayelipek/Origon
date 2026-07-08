import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonTicker — infinite horizontal marquee.
/// Source: Figma `- Ticker` (12:3551).

class OrigonTickerItem {
  final String key;
  final Widget content;
  const OrigonTickerItem({required this.key, required this.content});
}

class OrigonTicker extends StatefulWidget {
  final List<OrigonTickerItem> items;
  /// Loop duration in seconds. Higher = slower.
  final Duration duration;
  final double gap;
  final bool leftToRight;

  const OrigonTicker({
    super.key,
    required this.items,
    this.duration = const Duration(seconds: 40),
    this.gap = 40,
    this.leftToRight = false,
  });

  @override
  State<OrigonTicker> createState() => _OrigonTickerState();
}

class _OrigonTickerState extends State<OrigonTicker> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration)..repeat();
  }

  @override
  void didUpdateWidget(OrigonTicker old) {
    super.didUpdateWidget(old);
    if (old.duration != widget.duration) {
      _controller.duration = widget.duration;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final trackChildren = <Widget>[];
    for (final it in widget.items) {
      trackChildren.add(Padding(padding: EdgeInsets.only(right: widget.gap), child: it.content));
    }
    // Duplicate for seamless loop.
    for (final it in widget.items) {
      trackChildren.add(Padding(padding: EdgeInsets.only(right: widget.gap), child: it.content));
    }

    return Container(
      decoration: BoxDecoration(
        color: OrigonColors.blueGray.s100,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: EdgeInsets.symmetric(vertical: OrigonSpacing.xs),
      clipBehavior: Clip.hardEdge,
      child: LayoutBuilder(
        builder: (context, constraints) => AnimatedBuilder(
          animation: _controller,
          builder: (_, __) {
            final v = widget.leftToRight ? 1.0 - _controller.value : _controller.value;
            return Transform.translate(
              offset: Offset(-v * _measured, 0),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IntrinsicWidth(
                    child: DefaultTextStyle.merge(
                      style: TextStyle(color: theme.semantic.text.focus, fontFamily: OrigonFont.primary, fontSize: 13),
                      child: MeasuredRow(children: trackChildren, onWidth: (w) {
                        // The measured row spans 2x the content. We translate by half so it loops seamlessly.
                        if (_measured == 0 && w > 0) {
                          WidgetsBinding.instance.addPostFrameCallback((_) => setState(() => _measured = w / 2));
                        }
                      }),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  double _measured = 0;
}

class MeasuredRow extends StatelessWidget {
  final List<Widget> children;
  final ValueChanged<double> onWidth;
  const MeasuredRow({super.key, required this.children, required this.onWidth});

  @override
  Widget build(BuildContext context) {
    return _MeasuredRow(onWidth: onWidth, child: Row(mainAxisSize: MainAxisSize.min, children: children));
  }
}

class _MeasuredRow extends SingleChildRenderObjectWidget {
  final ValueChanged<double> onWidth;
  const _MeasuredRow({required this.onWidth, required super.child});

  @override
  RenderObject createRenderObject(BuildContext context) => _MeasureRender(onWidth: onWidth);

  @override
  void updateRenderObject(BuildContext context, _MeasureRender renderObject) {
    renderObject.onWidth = onWidth;
  }
}

class _MeasureRender extends RenderProxyBox {
  ValueChanged<double> onWidth;
  _MeasureRender({required this.onWidth});
  @override
  void performLayout() {
    super.performLayout();
    if (child != null) onWidth(child!.size.width);
  }
}
