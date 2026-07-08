import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonCheckbox — port of the React `<Checkbox>`.
/// Source: Figma `Checkbox` (12:86274).

enum OrigonCheckboxSize { small, medium, large }

class OrigonCheckbox extends StatelessWidget {
  final bool value;
  final ValueChanged<bool>? onChanged;
  final OrigonCheckboxSize size;
  final bool disabled;
  final bool error;
  final Widget? label;

  const OrigonCheckbox({
    super.key,
    required this.value,
    this.onChanged,
    this.size = OrigonCheckboxSize.medium,
    this.disabled = false,
    this.error = false,
    this.label,
  });

  double get _box {
    switch (size) {
      case OrigonCheckboxSize.large:  return 24;
      case OrigonCheckboxSize.medium: return 20;
      case OrigonCheckboxSize.small:  return 16;
    }
  }

  double get _radius => size == OrigonCheckboxSize.small ? OrigonRadius.xxs : OrigonRadius.xs;

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final effectiveDisabled = disabled || onChanged == null;
    final bg = value && !effectiveDisabled
        ? theme.semantic.button.primary
        : OrigonColors.blueGray.s50;
    final borderColor = error
        ? OrigonColors.red.s600
        : (value && !effectiveDisabled ? Colors.transparent : OrigonColors.coolGray.s700);

    return InkWell(
      onTap: effectiveDisabled ? null : () => onChanged?.call(!value),
      borderRadius: BorderRadius.circular(_radius),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: _box,
            height: _box,
            child: Stack(
              alignment: Alignment.center,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 120),
                  decoration: BoxDecoration(
                    color: bg,
                    border: Border.all(color: borderColor, width: 1),
                    borderRadius: BorderRadius.circular(_radius),
                  ),
                ),
                if (value && !effectiveDisabled)
                  Icon(Icons.check, color: OrigonColors.white, size: _box * 0.7),
                if (effectiveDisabled)
                  Container(
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: OrigonColors.coolGray.s700, width: 1),
                      ),
                    ),
                    width: _box * 1.2,
                    height: 0,
                    transform: Matrix4.rotationZ(-0.785398),
                  ),
              ],
            ),
          ),
          if (label != null) ...[
            SizedBox(width: OrigonSpacing.xs),
            DefaultTextStyle.merge(
              style: TextStyle(
                color: effectiveDisabled ? theme.semantic.text.disable : theme.semantic.text.focus,
                fontFamily: OrigonFont.primary,
                fontSize: 15,
              ),
              child: label!,
            ),
          ],
        ],
      ),
    );
  }
}
