import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonToggle — iOS-style switch.
/// Source: Figma `{FK-Toggle}` (12:3011).

enum OrigonToggleSize { small, medium, large }
enum OrigonToggleLabelPosition { left, right }

class OrigonToggle extends StatelessWidget {
  final bool checked;
  final ValueChanged<bool>? onChanged;
  final OrigonToggleSize size;
  final Widget? label;
  final OrigonToggleLabelPosition labelPosition;
  final bool disabled;

  const OrigonToggle({
    super.key,
    required this.checked,
    this.onChanged,
    this.size = OrigonToggleSize.medium,
    this.label,
    this.labelPosition = OrigonToggleLabelPosition.right,
    this.disabled = false,
  });

  ({double trackW, double trackH, double thumb, double pad}) get _dims {
    switch (size) {
      case OrigonToggleSize.large:  return (trackW: 44, trackH: 26, thumb: 22, pad: 2);
      case OrigonToggleSize.medium: return (trackW: 36, trackH: 22, thumb: 18, pad: 2);
      case OrigonToggleSize.small:  return (trackW: 28, trackH: 16, thumb: 12, pad: 2);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final d = _dims;
    final effectiveDisabled = disabled || onChanged == null;
    final trackColor = effectiveDisabled
        ? OrigonColors.blueGray.s300
        : checked ? theme.semantic.button.primary : OrigonColors.blueGray.s400;

    final track = GestureDetector(
      onTap: effectiveDisabled ? null : () => onChanged?.call(!checked),
      child: Container(
        width: d.trackW, height: d.trackH,
        decoration: BoxDecoration(
          color: trackColor,
          borderRadius: BorderRadius.circular(d.trackH / 2),
        ),
        child: Stack(
          children: [
            AnimatedPositioned(
              duration: const Duration(milliseconds: 160),
              curve: Curves.easeOutCubic,
              top: d.pad,
              left: checked ? d.trackW - d.thumb - d.pad : d.pad,
              child: Container(
                width: d.thumb, height: d.thumb,
                decoration: BoxDecoration(
                  color: OrigonColors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.35), blurRadius: 3, offset: const Offset(0, 1)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );

    if (label == null) return Semantics(toggled: checked, child: track);

    final children = <Widget>[
      if (labelPosition == OrigonToggleLabelPosition.left) ...[
        DefaultTextStyle.merge(
          style: TextStyle(
            color: effectiveDisabled ? theme.semantic.text.disable : theme.semantic.text.focus,
            fontFamily: OrigonFont.primary,
            fontSize: 15,
          ),
          child: label!,
        ),
        SizedBox(width: OrigonSpacing.sm),
      ],
      track,
      if (labelPosition == OrigonToggleLabelPosition.right) ...[
        SizedBox(width: OrigonSpacing.sm),
        DefaultTextStyle.merge(
          style: TextStyle(
            color: effectiveDisabled ? theme.semantic.text.disable : theme.semantic.text.focus,
            fontFamily: OrigonFont.primary,
            fontSize: 15,
          ),
          child: label!,
        ),
      ],
    ];

    return Semantics(
      toggled: checked,
      child: Row(mainAxisSize: MainAxisSize.min, children: children),
    );
  }
}
