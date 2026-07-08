import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonTabs — horizontal navigation. Source: Figma `{Tab}` (12:48473).

enum OrigonTabsVariant { underline, pill }

class OrigonTab {
  final String value;
  final Widget label;
  final Widget? icon;
  final bool disabled;
  const OrigonTab({required this.value, required this.label, this.icon, this.disabled = false});
}

class OrigonTabs extends StatefulWidget {
  final List<OrigonTab> tabs;
  final String? value;
  final ValueChanged<String>? onChanged;
  final OrigonTabsVariant variant;
  final bool fullWidth;
  final String? semanticLabel;

  const OrigonTabs({
    super.key,
    required this.tabs,
    this.value,
    this.onChanged,
    this.variant = OrigonTabsVariant.underline,
    this.fullWidth = false,
    this.semanticLabel,
  });

  @override
  State<OrigonTabs> createState() => _OrigonTabsState();
}

class _OrigonTabsState extends State<OrigonTabs> {
  late String _active;

  @override
  void initState() {
    super.initState();
    _active = widget.value ?? (widget.tabs.isNotEmpty ? widget.tabs.first.value : '');
  }

  @override
  void didUpdateWidget(OrigonTabs old) {
    super.didUpdateWidget(old);
    if (widget.value != null && widget.value != _active) _active = widget.value!;
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final isPill = widget.variant == OrigonTabsVariant.pill;
    final children = <Widget>[];
    for (var i = 0; i < widget.tabs.length; i++) {
      final t = widget.tabs[i];
      final selected = t.value == _active;
      final child = _tab(theme, t, selected, isPill);
      children.add(widget.fullWidth ? Expanded(child: child) : child);
      if (i < widget.tabs.length - 1 && isPill) children.add(SizedBox(width: OrigonSpacing.xxs));
    }

    final row = Row(mainAxisSize: MainAxisSize.min, children: children);
    return Semantics(
      label: widget.semanticLabel,
      container: true,
      child: Container(
        padding: isPill ? EdgeInsets.all(OrigonSpacing.xxs) : null,
        decoration: BoxDecoration(
          color: isPill ? OrigonColors.blueGray.s200 : null,
          borderRadius: isPill ? BorderRadius.circular(999) : null,
          border: !isPill ? Border(bottom: BorderSide(color: OrigonColors.blueGray.s300, width: 1)) : null,
        ),
        child: row,
      ),
    );
  }

  Widget _tab(OrigonThemeData theme, OrigonTab t, bool selected, bool isPill) {
    final fg = t.disabled
        ? theme.semantic.text.disable
        : selected ? theme.semantic.text.focus : theme.semantic.text.secondary;
    return GestureDetector(
      onTap: t.disabled ? null : () {
        if (widget.value == null) setState(() => _active = t.value);
        widget.onChanged?.call(t.value);
      },
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: OrigonSpacing.md,
          vertical: isPill ? OrigonSpacing.xs : OrigonSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: isPill && selected ? OrigonColors.blueGray.s400 : null,
          borderRadius: isPill ? BorderRadius.circular(999) : null,
          border: !isPill
              ? Border(
                  bottom: BorderSide(
                    color: selected ? theme.semantic.button.primary : Colors.transparent,
                    width: 2,
                  ),
                )
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (t.icon != null) ...[
              SizedBox(width: 16, height: 16, child: t.icon),
              SizedBox(width: OrigonSpacing.xs),
            ],
            DefaultTextStyle.merge(
              style: TextStyle(color: fg, fontFamily: OrigonFont.primary, fontSize: 13, fontWeight: OrigonFont.medium),
              child: t.label,
            ),
          ],
        ),
      ),
    );
  }
}
