import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonRadio — single-choice input.
/// Use inside [OrigonRadioGroup] for state + a11y.
/// Source: Figma `FK-Radio` (12:54256).

enum OrigonRadioSize { small, medium, large }
enum OrigonRadioOrientation { vertical, horizontal }

class OrigonRadioGroup<T> extends StatelessWidget {
  final String? label;
  final T? value;
  final ValueChanged<T>? onChanged;
  final bool disabled;
  final OrigonRadioSize size;
  final OrigonRadioOrientation orientation;
  final List<OrigonRadioOption<T>> options;

  const OrigonRadioGroup({
    super.key,
    required this.options,
    this.value,
    this.onChanged,
    this.disabled = false,
    this.size = OrigonRadioSize.medium,
    this.orientation = OrigonRadioOrientation.vertical,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final children = options.map((opt) {
      final selected = opt.value == value;
      final effectiveDisabled = disabled || opt.disabled;
      return _OrigonRadioItem<T>(
        option: opt,
        selected: selected,
        disabled: effectiveDisabled,
        size: size,
        onTap: effectiveDisabled ? null : () => onChanged?.call(opt.value),
        theme: theme,
      );
    }).toList();

    final gap = orientation == OrigonRadioOrientation.vertical ? OrigonSpacing.sm : OrigonSpacing.md;
    return Semantics(
      label: label,
      child: orientation == OrigonRadioOrientation.vertical
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                for (var i = 0; i < children.length; i++) ...[
                  if (i > 0) SizedBox(height: gap),
                  children[i],
                ],
              ],
            )
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                for (var i = 0; i < children.length; i++) ...[
                  if (i > 0) SizedBox(width: gap),
                  children[i],
                ],
              ],
            ),
    );
  }
}

class OrigonRadioOption<T> {
  final T value;
  final Widget label;
  final bool disabled;
  const OrigonRadioOption({required this.value, required this.label, this.disabled = false});
}

class _OrigonRadioItem<T> extends StatelessWidget {
  final OrigonRadioOption<T> option;
  final bool selected;
  final bool disabled;
  final OrigonRadioSize size;
  final VoidCallback? onTap;
  final OrigonThemeData theme;
  const _OrigonRadioItem({
    required this.option,
    required this.selected,
    required this.disabled,
    required this.size,
    required this.onTap,
    required this.theme,
  });

  ({double outer, double inner}) get _dims {
    switch (size) {
      case OrigonRadioSize.large:  return (outer: 22, inner: 10);
      case OrigonRadioSize.medium: return (outer: 18, inner: 8);
      case OrigonRadioSize.small:  return (outer: 14, inner: 6);
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = _dims;
    final borderColor = disabled
        ? OrigonColors.blueGray.s400
        : selected ? theme.semantic.button.primary : OrigonColors.coolGray.s700;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(d.outer),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: d.outer, height: d.outer,
            decoration: BoxDecoration(
              color: OrigonColors.blueGray.s50,
              shape: BoxShape.circle,
              border: Border.all(color: borderColor, width: 1),
            ),
            child: selected
                ? Center(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 120),
                      width: d.inner, height: d.inner,
                      decoration: BoxDecoration(
                        color: disabled ? OrigonColors.blueGray.s400 : theme.semantic.button.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  )
                : null,
          ),
          SizedBox(width: OrigonSpacing.xs),
          DefaultTextStyle.merge(
            style: TextStyle(
              color: disabled ? theme.semantic.text.disable : theme.semantic.text.focus,
              fontFamily: OrigonFont.primary,
              fontSize: 15,
            ),
            child: option.label,
          ),
        ],
      ),
    );
  }
}
