import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonInput — port of the React `<Input>`.
/// Source: Figma `{FKInput}` (12:68514).

enum OrigonInputSize { large, small, xSmall }

class OrigonInput extends StatefulWidget {
  final OrigonInputSize size;
  final String? label;
  final String? hint;
  final String? errorText;
  final Widget? leftIcon;
  final Widget? rightIcon;
  final bool enabled;
  final String? placeholder;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;

  const OrigonInput({
    super.key,
    this.size = OrigonInputSize.large,
    this.label,
    this.hint,
    this.errorText,
    this.leftIcon,
    this.rightIcon,
    this.enabled = true,
    this.placeholder,
    this.controller,
    this.onChanged,
  });

  @override
  State<OrigonInput> createState() => _OrigonInputState();
}

class _OrigonInputState extends State<OrigonInput> {
  bool _focused = false;
  late final FocusNode _fn;

  @override
  void initState() {
    super.initState();
    _fn = FocusNode()..addListener(() => setState(() => _focused = _fn.hasFocus));
  }

  @override
  void dispose() {
    _fn.dispose();
    super.dispose();
  }

  double get _height {
    switch (widget.size) {
      case OrigonInputSize.large:  return 54;
      case OrigonInputSize.small:  return 44;
      case OrigonInputSize.xSmall: return 32;
    }
  }

  double get _fontSize {
    switch (widget.size) {
      case OrigonInputSize.large:  return 15;
      case OrigonInputSize.small:  return 13;
      case OrigonInputSize.xSmall: return 11;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final hasError = widget.errorText != null && widget.errorText!.isNotEmpty;
    final bg = widget.enabled
        ? (_focused && !hasError ? OrigonColors.blueGray.s400 : OrigonColors.blueGray.s200)
        : OrigonColors.blueGray.s200;
    final borderColor = hasError ? OrigonColors.red.s600 : Colors.transparent;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null)
          Padding(
            padding: EdgeInsets.only(bottom: OrigonSpacing.xxs, left: 2),
            child: Text(
              widget.label!,
              style: TextStyle(
                color: widget.enabled ? theme.semantic.text.secondary : theme.semantic.text.disable,
                fontFamily: OrigonFont.primary,
                fontSize: 11,
                fontWeight: OrigonFont.medium,
              ),
            ),
          ),
        Container(
          height: _height,
          padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.md),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(OrigonRadius.sm),
            border: Border.all(color: borderColor, width: 1),
          ),
          child: Row(
            children: [
              if (widget.leftIcon != null) ...[
                IconTheme.merge(data: IconThemeData(color: theme.semantic.text.secondary, size: 20), child: widget.leftIcon!),
                SizedBox(width: OrigonSpacing.xs),
              ],
              Expanded(
                child: TextField(
                  focusNode: _fn,
                  controller: widget.controller,
                  onChanged: widget.onChanged,
                  enabled: widget.enabled,
                  style: TextStyle(
                    color: widget.enabled ? theme.semantic.text.focus : theme.semantic.text.disable,
                    fontFamily: OrigonFont.primary,
                    fontSize: _fontSize,
                  ),
                  decoration: InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                    hintText: widget.placeholder,
                    hintStyle: TextStyle(color: theme.semantic.text.secondary),
                  ),
                ),
              ),
              if (widget.rightIcon != null) ...[
                SizedBox(width: OrigonSpacing.xs),
                IconTheme.merge(data: IconThemeData(color: theme.semantic.text.secondary, size: 20), child: widget.rightIcon!),
              ],
            ],
          ),
        ),
        if (widget.hint != null || hasError)
          Padding(
            padding: EdgeInsets.only(top: OrigonSpacing.xxs, left: 2),
            child: Text(
              hasError ? widget.errorText! : widget.hint!,
              style: TextStyle(
                color: hasError ? OrigonColors.red.s500 : theme.semantic.text.secondary,
                fontFamily: OrigonFont.primary,
                fontSize: 11,
              ),
            ),
          ),
      ],
    );
  }
}
