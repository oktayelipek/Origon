import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonBullet — step indicator port.
/// Source: Figma `Bullet [Line]` (8:837) and `Bullet [Dots]` (8:866).

enum OrigonBulletVariant { line, dots }

class OrigonBullet extends StatelessWidget {
  final int count;
  final int active;
  final OrigonBulletVariant variant;

  const OrigonBullet({
    super.key,
    required this.count,
    required this.active,
    this.variant = OrigonBulletVariant.dots,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final size = variant == OrigonBulletVariant.line ? const Size(40, 4) : const Size(8, 8);
    return Semantics(
      label: 'Step ${active + 1} of $count',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(count, (i) {
          return Padding(
            padding: EdgeInsets.only(left: i == 0 ? 0 : OrigonSpacing.xs),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              width: size.width,
              height: size.height,
              decoration: BoxDecoration(
                color: i == active ? theme.semantic.text.focus : OrigonColors.blueGray.s300,
                borderRadius: BorderRadius.circular(OrigonRadius.xxl),
              ),
            ),
          );
        }),
      ),
    );
  }
}
