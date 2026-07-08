import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonNotificationBadge — dot/count overlay.
/// Source: Figma `- Notification Badge` (12:55791).

enum OrigonBadgeTone { brand, success, warning, danger }

class OrigonNotificationBadge extends StatelessWidget {
  final Widget child;
  final int? count;
  final String? text;
  final bool dot;
  final int max;
  final bool showZero;
  final OrigonBadgeTone tone;

  const OrigonNotificationBadge({
    super.key,
    required this.child,
    this.count,
    this.text,
    this.dot = false,
    this.max = 99,
    this.showZero = false,
    this.tone = OrigonBadgeTone.danger,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final shouldShow = dot
        || (text != null && text!.isNotEmpty)
        || showZero
        || (count != null && count! > 0);
    if (!shouldShow) return child;

    final display = dot
        ? ''
        : text ?? (count != null && count! > max ? '$max+' : (count?.toString() ?? ''));

    final color = _tone(theme, tone);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        Positioned(
          top: dot ? -2 : -6,
          right: dot ? -2 : -6,
          child: Container(
            constraints: BoxConstraints(minWidth: dot ? 8 : 18, minHeight: dot ? 8 : 18),
            padding: EdgeInsets.symmetric(horizontal: dot ? 0 : 5),
            decoration: BoxDecoration(
              color: color,
              shape: dot ? BoxShape.circle : BoxShape.rectangle,
              borderRadius: dot ? null : BorderRadius.circular(999),
              border: Border.all(color: OrigonColors.blueGray.s100, width: 2),
            ),
            child: dot ? null : Center(
              child: Text(
                display,
                style: TextStyle(
                  color: OrigonColors.white,
                  fontFamily: OrigonFont.primary,
                  fontSize: 10,
                  fontWeight: OrigonFont.medium,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Color _tone(OrigonThemeData theme, OrigonBadgeTone t) {
    switch (t) {
      case OrigonBadgeTone.brand:   return theme.semantic.button.primary;
      case OrigonBadgeTone.success: return OrigonColors.green.s600;
      case OrigonBadgeTone.warning: return OrigonColors.amber.s500;
      case OrigonBadgeTone.danger:  return OrigonColors.red.s600;
    }
  }
}
