import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonKeyboard — numpad port.
/// Source: Figma `- Keyboards` (12:58173).

enum OrigonKeyboardLayout { numeric, decimal }

class OrigonKeyboard extends StatelessWidget {
  final OrigonKeyboardLayout layout;
  final ValueChanged<String>? onKey;
  final VoidCallback? onBackspace;
  final VoidCallback? onConfirm;
  final Widget? confirmContent;

  const OrigonKeyboard({
    super.key,
    this.layout = OrigonKeyboardLayout.numeric,
    this.onKey,
    this.onBackspace,
    this.onConfirm,
    this.confirmContent,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final bottomLeft = layout == OrigonKeyboardLayout.decimal ? '.' : null;
    final rows = <List<String?>>[
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      [bottomLeft, '0', 'backspace'],
    ];

    return Container(
      padding: EdgeInsets.all(OrigonSpacing.sm),
      decoration: BoxDecoration(
        color: OrigonColors.blueGray.s100,
        borderRadius: BorderRadius.circular(OrigonRadius.sm),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final row in rows)
            Padding(
              padding: EdgeInsets.only(bottom: OrigonSpacing.xs),
              child: Row(
                children: [
                  for (var i = 0; i < row.length; i++) ...[
                    if (i > 0) SizedBox(width: OrigonSpacing.xs),
                    Expanded(child: _key(theme, row[i])),
                  ],
                ],
              ),
            ),
          if (onConfirm != null)
            SizedBox(
              width: double.infinity,
              child: _key(theme, 'confirm'),
            ),
        ],
      ),
    );
  }

  Widget _key(OrigonThemeData theme, String? k) {
    if (k == null) return const SizedBox(height: 48);
    final isConfirm = k == 'confirm';
    final isBack = k == 'backspace';
    return GestureDetector(
      onTap: () {
        if (isConfirm) onConfirm?.call();
        else if (isBack) onBackspace?.call();
        else onKey?.call(k);
      },
      child: Container(
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isConfirm ? theme.semantic.button.primary : OrigonColors.blueGray.s200,
          borderRadius: BorderRadius.circular(OrigonRadius.sm),
        ),
        child: isBack
            ? Icon(Icons.backspace_outlined, color: theme.semantic.text.focus, size: 22)
            : isConfirm
                ? (confirmContent ?? Icon(Icons.check, color: OrigonColors.white, size: 22))
                : Text(
                    k,
                    style: TextStyle(
                      color: theme.semantic.text.focus,
                      fontFamily: OrigonFont.primary,
                      fontSize: 20,
                      fontWeight: OrigonFont.medium,
                    ),
                  ),
      ),
    );
  }
}
