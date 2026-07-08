import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI [OrigonButton] — 1:1 port of the React `<Button>` component.
/// Source: Figma component set `{FKButton}` (node 8:135).
///
/// Design decisions and pixel values are mirrored from the canonical React
/// implementation at packages/react/src/Button/Button.tsx. Keep the two in sync.

enum OrigonButtonSize { small, medium, large }

enum OrigonButtonVariant { primary, focus, outline, ghost }

enum OrigonButtonPresence { defaultPresence, subtle }

enum OrigonButtonIconPosition { leading, trailing, only }

enum OrigonButtonDirection { horizontal, vertical }

class _SizeSpec {
  final double paddingX;
  final double paddingY;
  final double radius;
  final double height;
  final double fontSize;
  final double lineHeight;
  final double iconSize;
  final double gap;

  const _SizeSpec({
    required this.paddingX,
    required this.paddingY,
    required this.radius,
    required this.height,
    required this.fontSize,
    required this.lineHeight,
    required this.iconSize,
    required this.gap,
  });
}

const Map<OrigonButtonSize, _SizeSpec> _sizeSpecs = {
  OrigonButtonSize.large: _SizeSpec(
    paddingX: 48, paddingY: 12, radius: 12, height: 44,
    fontSize: 15, lineHeight: 20, iconSize: 20, gap: 8,
  ),
  OrigonButtonSize.medium: _SizeSpec(
    paddingX: 40, paddingY: 8, radius: 8, height: 34,
    fontSize: 13, lineHeight: 18, iconSize: 16, gap: 8,
  ),
  OrigonButtonSize.small: _SizeSpec(
    paddingX: 12, paddingY: 4, radius: 28, height: 22,
    fontSize: 11, lineHeight: 14, iconSize: 14, gap: 4,
  ),
};

class OrigonButton extends StatefulWidget {
  final Widget? child;
  final Widget? icon;
  final OrigonButtonSize size;
  final OrigonButtonVariant variant;
  final OrigonButtonPresence presence;
  final OrigonButtonIconPosition iconPosition;
  final OrigonButtonDirection direction;
  final VoidCallback? onPressed;
  final bool fullWidth;

  const OrigonButton({
    super.key,
    this.child,
    this.icon,
    this.size = OrigonButtonSize.large,
    this.variant = OrigonButtonVariant.primary,
    this.presence = OrigonButtonPresence.defaultPresence,
    this.iconPosition = OrigonButtonIconPosition.leading,
    this.direction = OrigonButtonDirection.horizontal,
    this.onPressed,
    this.fullWidth = false,
  });

  @override
  State<OrigonButton> createState() => _OrigonButtonState();
}

class _OrigonButtonState extends State<OrigonButton> {
  bool _hovered = false;
  bool _pressed = false;

  ({Color bg, Color fg, Color? border}) _colors(OrigonThemeData theme) {
    final disabled = widget.onPressed == null;
    if (disabled) {
      final isOutlineOrGhost = widget.variant == OrigonButtonVariant.outline ||
          widget.variant == OrigonButtonVariant.ghost;
      return (
        bg: isOutlineOrGhost ? Colors.transparent : theme.semantic.button.disable,
        fg: theme.semantic.text.disable,
        border: widget.variant == OrigonButtonVariant.outline
            ? theme.semantic.border.level2
            : null,
      );
    }

    Color baseBg;
    Color baseFg;
    Color? baseBorder;
    switch (widget.variant) {
      case OrigonButtonVariant.primary:
        baseBg = theme.semantic.button.primary;
        baseFg = OrigonColors.white;
        baseBorder = null;
        break;
      case OrigonButtonVariant.focus:
        baseBg = theme.semantic.button.focus;
        baseFg = OrigonColors.blueGray.s50;
        baseBorder = null;
        break;
      case OrigonButtonVariant.outline:
        baseBg = Colors.transparent;
        baseFg = theme.semantic.text.focus;
        baseBorder = theme.semantic.border.level5;
        break;
      case OrigonButtonVariant.ghost:
        baseBg = Colors.transparent;
        baseFg = theme.semantic.text.focus;
        baseBorder = null;
        break;
    }

    if (widget.presence == OrigonButtonPresence.subtle &&
        (widget.variant == OrigonButtonVariant.primary ||
            widget.variant == OrigonButtonVariant.focus)) {
      return (bg: baseBg.withOpacity(0.16), fg: baseBg, border: null);
    }

    if (_pressed) {
      return (bg: _shade(baseBg, -0.16), fg: baseFg, border: baseBorder);
    }
    if (_hovered) {
      return (bg: _shade(baseBg, -0.08), fg: baseFg, border: baseBorder);
    }
    return (bg: baseBg, fg: baseFg, border: baseBorder);
  }

  Color _shade(Color c, double ratio) {
    if (c.alpha == 0) return c;
    int adjust(int v) => (v + (ratio < 0 ? v * ratio : (255 - v) * ratio)).round().clamp(0, 255);
    return Color.fromARGB(c.alpha, adjust(c.red), adjust(c.green), adjust(c.blue));
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final spec = _sizeSpecs[widget.size]!;
    final c = _colors(theme);
    final iconOnly = widget.iconPosition == OrigonButtonIconPosition.only ||
        (widget.child == null && widget.icon != null);
    final isVertical = widget.direction == OrigonButtonDirection.vertical && !iconOnly && widget.icon != null;

    final content = <Widget>[
      if (widget.icon != null &&
          (widget.iconPosition == OrigonButtonIconPosition.leading ||
              widget.iconPosition == OrigonButtonIconPosition.only ||
              isVertical))
        SizedBox(width: spec.iconSize, height: spec.iconSize, child: widget.icon),
      if (widget.child != null && widget.iconPosition != OrigonButtonIconPosition.only)
        DefaultTextStyle.merge(
          style: TextStyle(
            color: c.fg,
            fontFamily: OrigonFont.primary,
            fontSize: spec.fontSize,
            height: spec.lineHeight / spec.fontSize,
            fontWeight: OrigonFont.medium,
          ),
          child: widget.child!,
        ),
      if (widget.icon != null && widget.iconPosition == OrigonButtonIconPosition.trailing && !isVertical)
        SizedBox(width: spec.iconSize, height: spec.iconSize, child: widget.icon),
    ];

    final buttonInner = Container(
      constraints: BoxConstraints(minHeight: isVertical ? 0 : spec.height),
      padding: EdgeInsets.symmetric(
        horizontal: iconOnly ? spec.paddingY : isVertical ? spec.paddingY * 2 : spec.paddingX,
        vertical: spec.paddingY,
      ),
      decoration: BoxDecoration(
        color: c.bg,
        borderRadius: BorderRadius.circular(spec.radius),
        border: c.border != null ? Border.all(color: c.border!, width: 1) : null,
      ),
      child: isVertical
          ? Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                for (var i = 0; i < content.length; i++) ...[
                  if (i > 0) SizedBox(height: spec.gap / 2),
                  content[i],
                ],
              ],
            )
          : Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                for (var i = 0; i < content.length; i++) ...[
                  if (i > 0) SizedBox(width: spec.gap),
                  content[i],
                ],
              ],
            ),
    );

    final gestureDetector = MouseRegion(
      cursor: widget.onPressed != null ? SystemMouseCursors.click : SystemMouseCursors.forbidden,
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) => setState(() => _pressed = false),
        onTapCancel: () => setState(() => _pressed = false),
        onTap: widget.onPressed,
        child: buttonInner,
      ),
    );

    if (widget.fullWidth) {
      return SizedBox(width: double.infinity, child: gestureDetector);
    }
    return gestureDetector;
  }
}
