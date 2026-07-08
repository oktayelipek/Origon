import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonChip — port of the React `<Chip>`. Two roles:
/// - Display (line/solid variant)
/// - Selector (interactive toggle when [onSelect] is provided)
/// Source: Figma `Chip` (12:86248) and `Chip [Selector]` (12:86235).

enum OrigonChipSize { xs, sm, md, lg }
enum OrigonChipVariant { line, solid }

class OrigonChip extends StatelessWidget {
  final Widget child;
  final OrigonChipSize size;
  final OrigonChipVariant variant;
  final bool? selected;
  final ValueChanged<bool>? onSelect;
  final Widget? icon;

  const OrigonChip({
    super.key,
    required this.child,
    this.size = OrigonChipSize.md,
    this.variant = OrigonChipVariant.line,
    this.selected,
    this.onSelect,
    this.icon,
  });

  ({double paddingX, double paddingY, double height, double fontSize, double gap, double iconSize}) get _spec {
    switch (size) {
      case OrigonChipSize.lg: return (paddingX: 40, paddingY: 16, height: 46, fontSize: 15, gap: 8,  iconSize: 20);
      case OrigonChipSize.md: return (paddingX: 32, paddingY: 12, height: 38, fontSize: 13, gap: 8,  iconSize: 18);
      case OrigonChipSize.sm: return (paddingX: 24, paddingY: 8,  height: 30, fontSize: 11, gap: 4,  iconSize: 14);
      case OrigonChipSize.xs: return (paddingX: 8,  paddingY: 4,  height: 20, fontSize: 11, gap: 4,  iconSize: 12);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final interactive = onSelect != null || selected != null;
    final isSelected = selected ?? false;

    Color bg;
    Color fg;
    Color? border;
    if (interactive) {
      bg = isSelected ? theme.semantic.button.primary : Colors.transparent;
      fg = isSelected ? OrigonColors.white : theme.semantic.text.focus;
      border = isSelected ? null : OrigonColors.blueGray.s300;
    } else {
      bg = variant == OrigonChipVariant.solid ? OrigonColors.blueGray.s200 : Colors.transparent;
      fg = theme.semantic.text.focus;
      border = OrigonColors.blueGray.s200;
    }

    final spec = _spec;

    final content = Container(
      constraints: BoxConstraints(minHeight: spec.height),
      padding: EdgeInsets.symmetric(horizontal: spec.paddingX, vertical: spec.paddingY),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(OrigonRadius.xxl),
        border: border != null ? Border.all(color: border, width: 1) : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (icon != null) ...[
            SizedBox(width: spec.iconSize, height: spec.iconSize, child: icon),
            SizedBox(width: spec.gap),
          ],
          DefaultTextStyle.merge(
            style: TextStyle(
              color: fg,
              fontFamily: OrigonFont.primary,
              fontSize: spec.fontSize,
              fontWeight: OrigonFont.medium,
            ),
            child: child,
          ),
        ],
      ),
    );

    if (interactive) {
      return Semantics(
        button: true,
        selected: isSelected,
        child: GestureDetector(
          onTap: () => onSelect?.call(!isSelected),
          behavior: HitTestBehavior.opaque,
          child: content,
        ),
      );
    }
    return content;
  }
}
