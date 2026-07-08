import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonSegmentedControl — mutually-exclusive choice pill group.
/// Source: Figma `- Segmented Control` (12:49453).

enum OrigonSegmentedSize { small, medium }

class OrigonSegmentedOption<T> {
  final T value;
  final Widget label;
  final Widget? icon;
  final bool disabled;
  const OrigonSegmentedOption({required this.value, required this.label, this.icon, this.disabled = false});
}

class OrigonSegmentedControl<T> extends StatefulWidget {
  final List<OrigonSegmentedOption<T>> options;
  final T? value;
  final ValueChanged<T>? onChanged;
  final OrigonSegmentedSize size;
  final bool fullWidth;
  final String? semanticLabel;

  const OrigonSegmentedControl({
    super.key,
    required this.options,
    this.value,
    this.onChanged,
    this.size = OrigonSegmentedSize.medium,
    this.fullWidth = false,
    this.semanticLabel,
  });

  @override
  State<OrigonSegmentedControl<T>> createState() => _OrigonSegmentedControlState<T>();
}

class _OrigonSegmentedControlState<T> extends State<OrigonSegmentedControl<T>> {
  late T? _active;

  @override
  void initState() {
    super.initState();
    _active = widget.value ?? (widget.options.isNotEmpty ? widget.options.first.value : null);
  }

  @override
  void didUpdateWidget(OrigonSegmentedControl<T> old) {
    super.didUpdateWidget(old);
    if (widget.value != null && widget.value != _active) _active = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final height = widget.size == OrigonSegmentedSize.small ? 30.0 : 38.0;
    final fontSize = widget.size == OrigonSegmentedSize.small ? 11.0 : 13.0;

    final children = <Widget>[];
    for (var i = 0; i < widget.options.length; i++) {
      final opt = widget.options[i];
      final selected = opt.value == _active;
      final child = GestureDetector(
        onTap: opt.disabled ? null : () {
          if (widget.value == null) setState(() => _active = opt.value);
          widget.onChanged?.call(opt.value);
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          height: height,
          padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.md),
          decoration: BoxDecoration(
            color: selected ? OrigonColors.blueGray.s400 : Colors.transparent,
            borderRadius: BorderRadius.circular(OrigonRadius.xxl),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (opt.icon != null) ...[
                SizedBox(width: 14, height: 14, child: opt.icon),
                SizedBox(width: OrigonSpacing.xxs),
              ],
              DefaultTextStyle.merge(
                style: TextStyle(
                  color: opt.disabled ? theme.semantic.text.disable : selected ? theme.semantic.text.focus : theme.semantic.text.secondary,
                  fontFamily: OrigonFont.primary,
                  fontSize: fontSize,
                  fontWeight: selected ? OrigonFont.medium : OrigonFont.regular,
                ),
                child: opt.label,
              ),
            ],
          ),
        ),
      );
      children.add(widget.fullWidth ? Expanded(child: child) : child);
      if (i < widget.options.length - 1) children.add(const SizedBox(width: 4));
    }

    return Semantics(
      label: widget.semanticLabel,
      container: true,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: OrigonColors.blueGray.s200,
          borderRadius: BorderRadius.circular(OrigonRadius.xxl),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: children),
      ),
    );
  }
}
