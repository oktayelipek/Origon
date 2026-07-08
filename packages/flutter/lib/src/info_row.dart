import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonInfoRow — port of the React `<InfoRow>`.
/// Source: Figma `FK-InfoRow` (12:73137).

enum OrigonInfoRowTone { info, focus, caution, warning }
enum OrigonInfoRowPresence { low, high }

class OrigonInfoRow extends StatelessWidget {
  final Widget message;
  final OrigonInfoRowTone tone;
  final OrigonInfoRowPresence presence;
  final bool boxed;
  final Widget? icon;
  final VoidCallback? onDismiss;

  const OrigonInfoRow({
    super.key,
    required this.message,
    this.tone = OrigonInfoRowTone.info,
    this.presence = OrigonInfoRowPresence.low,
    this.boxed = true,
    this.icon,
    this.onDismiss,
  });

  ({Color bg, Color fg, Color border}) _colorsFor(OrigonThemeData theme) {
    switch (tone) {
      case OrigonInfoRowTone.info:
        return presence == OrigonInfoRowPresence.high
            ? (bg: OrigonColors.blueGray.s300, fg: theme.semantic.text.focus, border: OrigonColors.blueGray.s300)
            : (bg: OrigonColors.blueGray.s200, fg: theme.semantic.text.focus, border: OrigonColors.blueGray.s300);
      case OrigonInfoRowTone.focus:
        return presence == OrigonInfoRowPresence.high
            ? (bg: theme.semantic.button.primary, fg: OrigonColors.white, border: theme.semantic.button.primary)
            : (bg: theme.semantic.button.primary.withOpacity(0.12), fg: theme.semantic.button.primary, border: theme.semantic.button.primary);
      case OrigonInfoRowTone.caution:
        return presence == OrigonInfoRowPresence.high
            ? (bg: OrigonColors.amber.s600, fg: OrigonColors.blueGray.s50, border: OrigonColors.amber.s600)
            : (bg: OrigonColors.amber.s600.withOpacity(0.14), fg: OrigonColors.amber.s500, border: OrigonColors.amber.s600);
      case OrigonInfoRowTone.warning:
        return presence == OrigonInfoRowPresence.high
            ? (bg: OrigonColors.red.s600, fg: OrigonColors.white, border: OrigonColors.red.s600)
            : (bg: OrigonColors.red.s600.withOpacity(0.14), fg: OrigonColors.red.s400, border: OrigonColors.red.s600);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final c = _colorsFor(theme);
    return Container(
      constraints: const BoxConstraints(minHeight: 52),
      padding: EdgeInsets.all(OrigonSpacing.md),
      decoration: BoxDecoration(
        color: c.bg,
        borderRadius: boxed ? BorderRadius.circular(OrigonRadius.sm) : null,
        border: boxed ? Border.all(color: c.border, width: 1) : null,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            SizedBox(width: 20, height: 20, child: IconTheme.merge(data: IconThemeData(color: c.fg, size: 20), child: icon!)),
            SizedBox(width: OrigonSpacing.sm),
          ],
          Expanded(
            child: DefaultTextStyle.merge(
              style: TextStyle(
                color: c.fg,
                fontFamily: OrigonFont.primary,
                fontSize: 13,
                height: 18 / 13,
              ),
              child: message,
            ),
          ),
          if (onDismiss != null) ...[
            SizedBox(width: OrigonSpacing.sm),
            GestureDetector(
              onTap: onDismiss,
              child: Icon(Icons.close, size: 16, color: c.fg.withOpacity(0.8)),
            ),
          ],
        ],
      ),
    );
  }
}
