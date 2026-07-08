import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonTooltip — wraps Flutter's built-in Tooltip with Origon
/// styling. Source: Figma `{FK-Tooltip}` (11:2720).
///
/// Usage:
///
///     OrigonTooltip(
///       message: 'Places a limit order at your price',
///       child: OrigonButton(child: Text('?')),
///     );

class OrigonTooltip extends StatelessWidget {
  final String message;
  final Widget child;
  final Duration showDelay;
  final Duration waitDuration;

  const OrigonTooltip({
    super.key,
    required this.message,
    required this.child,
    this.showDelay = const Duration(milliseconds: 250),
    this.waitDuration = const Duration(milliseconds: 250),
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    return Tooltip(
      message: message,
      waitDuration: waitDuration,
      textStyle: TextStyle(
        color: theme.semantic.text.focus,
        fontFamily: OrigonFont.primary,
        fontSize: 11,
      ),
      decoration: BoxDecoration(
        color: OrigonColors.blueGray.s100,
        borderRadius: BorderRadius.circular(OrigonRadius.xs),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 6))],
      ),
      padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.sm, vertical: OrigonSpacing.xs),
      child: child,
    );
  }
}
