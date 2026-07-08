import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonMenu — anchored action list.
/// Source: Figma `- Menu` (12:55798). Uses Flutter's PopupMenuButton internally.

class OrigonMenuItem {
  final String value;
  final Widget label;
  final Widget? icon;
  final bool disabled;
  final bool danger;
  final bool divider;
  const OrigonMenuItem({
    required this.value,
    required this.label,
    this.icon,
    this.disabled = false,
    this.danger = false,
    this.divider = false,
  });
}

class OrigonMenu extends StatelessWidget {
  final Widget trigger;
  final List<OrigonMenuItem> items;
  final ValueChanged<String>? onSelect;

  const OrigonMenu({super.key, required this.trigger, required this.items, this.onSelect});

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    return PopupMenuButton<String>(
      color: OrigonColors.blueGray.s200,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(OrigonRadius.sm),
        side: BorderSide(color: OrigonColors.blueGray.s400, width: 1),
      ),
      elevation: 8,
      offset: const Offset(0, 4),
      onSelected: (v) => onSelect?.call(v),
      itemBuilder: (_) {
        final entries = <PopupMenuEntry<String>>[];
        for (var i = 0; i < items.length; i++) {
          final item = items[i];
          if (item.divider && i > 0) entries.add(const PopupMenuDivider());
          entries.add(PopupMenuItem<String>(
            value: item.value,
            enabled: !item.disabled,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (item.icon != null) ...[
                  SizedBox(width: 16, height: 16, child: item.icon),
                  SizedBox(width: OrigonSpacing.sm),
                ],
                DefaultTextStyle.merge(
                  style: TextStyle(
                    color: item.disabled
                        ? theme.semantic.text.disable
                        : item.danger ? OrigonColors.red.s500 : theme.semantic.text.focus,
                    fontFamily: OrigonFont.primary,
                    fontSize: 13,
                  ),
                  child: item.label,
                ),
              ],
            ),
          ));
        }
        return entries;
      },
      child: trigger,
    );
  }
}
