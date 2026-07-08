import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonDropdown — port of the React `<Dropdown>`.
/// Source: Figma `- Dropdown/Combo` (12:85331).

class OrigonDropdownOption<T> {
  final T value;
  final String label;
  final bool disabled;
  const OrigonDropdownOption({required this.value, required this.label, this.disabled = false});
}

class OrigonDropdown<T> extends StatelessWidget {
  final List<OrigonDropdownOption<T>> options;
  final T? value;
  final ValueChanged<T>? onChanged;
  final String placeholder;
  final bool disabled;

  const OrigonDropdown({
    super.key,
    required this.options,
    this.value,
    this.onChanged,
    this.placeholder = 'Select…',
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final selected = options.where((o) => o.value == value).firstOrNull;
    final bg = disabled ? OrigonColors.blueGray.s100 : OrigonColors.blueGray.s200;

    return PopupMenuButton<T>(
      enabled: !disabled,
      color: OrigonColors.blueGray.s200,
      itemBuilder: (_) => options.map((opt) {
        final isSelected = opt.value == value;
        return PopupMenuItem<T>(
          value: opt.value,
          enabled: !opt.disabled,
          child: Text(
            opt.label,
            style: TextStyle(
              color: opt.disabled ? theme.semantic.text.disable : theme.semantic.text.focus,
              fontWeight: isSelected ? OrigonFont.medium : OrigonFont.regular,
            ),
          ),
        );
      }).toList(),
      onSelected: (v) => onChanged?.call(v),
      child: Container(
        height: 44,
        padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.md),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(OrigonRadius.sm)),
        child: Row(
          children: [
            Expanded(
              child: Text(
                selected?.label ?? placeholder,
                style: TextStyle(
                  color: disabled
                      ? theme.semantic.text.disable
                      : selected != null ? theme.semantic.text.focus : theme.semantic.text.secondary,
                  fontFamily: OrigonFont.primary,
                  fontSize: 15,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Icon(Icons.keyboard_arrow_down, size: 16, color: theme.semantic.text.secondary),
          ],
        ),
      ),
    );
  }
}

extension _FirstWhereOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
