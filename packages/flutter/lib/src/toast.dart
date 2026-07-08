import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI toast helpers — call [showOrigonToast] from anywhere with a
/// [BuildContext]. Uses ScaffoldMessenger under the hood so it stays alive
/// across route pushes.
/// Source: Figma `{FK-Toast-Row}` (12:3039).

enum OrigonToastTone { info, success, warning, danger }

void showOrigonToast(
  BuildContext context, {
  required String message,
  String? title,
  OrigonToastTone tone = OrigonToastTone.info,
  Duration duration = const Duration(seconds: 4),
  Widget? icon,
  ({String label, VoidCallback onPressed})? action,
}) {
  final messenger = ScaffoldMessenger.of(context);
  final theme = OrigonTheme.of(context);
  final accent = _accent(theme, tone);

  messenger.showSnackBar(
    SnackBar(
      backgroundColor: OrigonColors.blueGray.s200,
      elevation: 8,
      duration: duration == Duration.zero ? const Duration(days: 1) : duration,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(OrigonRadius.sm),
        side: BorderSide(color: accent, width: 0), // border-left via padding trick below
      ),
      padding: EdgeInsets.zero,
      content: Container(
        decoration: BoxDecoration(
          border: Border(left: BorderSide(color: accent, width: 3)),
          borderRadius: BorderRadius.circular(OrigonRadius.sm),
        ),
        padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.md, vertical: OrigonSpacing.sm),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (icon != null) ...[
              IconTheme.merge(data: IconThemeData(color: accent, size: 20), child: icon),
              SizedBox(width: OrigonSpacing.sm),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (title != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Text(title, style: TextStyle(color: theme.semantic.text.focus, fontFamily: OrigonFont.primary, fontSize: 13, fontWeight: OrigonFont.medium)),
                    ),
                  Text(message, style: TextStyle(color: theme.semantic.text.focus, fontFamily: OrigonFont.primary, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
      action: action != null
          ? SnackBarAction(
              label: action.label,
              textColor: accent,
              onPressed: action.onPressed,
            )
          : null,
    ),
  );
}

Color _accent(OrigonThemeData theme, OrigonToastTone t) {
  switch (t) {
    case OrigonToastTone.info:    return theme.semantic.button.primary;
    case OrigonToastTone.success: return OrigonColors.green.s600;
    case OrigonToastTone.warning: return OrigonColors.amber.s500;
    case OrigonToastTone.danger:  return OrigonColors.red.s600;
  }
}
