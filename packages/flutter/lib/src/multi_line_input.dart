import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonMultiLineInput — textarea variant of [OrigonInput].
/// Source: Figma FKInput Feature=Multi Line (12:68514).

class OrigonMultiLineInput extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? errorText;
  final int rows;
  final int maxRows;
  final bool autoResize;
  final bool enabled;
  final bool showCounter;
  final int? maxLength;
  final String? placeholder;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;

  const OrigonMultiLineInput({
    super.key,
    this.label,
    this.hint,
    this.errorText,
    this.rows = 3,
    this.maxRows = 8,
    this.autoResize = false,
    this.enabled = true,
    this.showCounter = false,
    this.maxLength,
    this.placeholder,
    this.controller,
    this.onChanged,
  });

  @override
  State<OrigonMultiLineInput> createState() => _OrigonMultiLineInputState();
}

class _OrigonMultiLineInputState extends State<OrigonMultiLineInput> {
  bool _focused = false;
  late final FocusNode _fn;
  late final TextEditingController _ctrl;

  @override
  void initState() {
    super.initState();
    _fn = FocusNode()..addListener(() => setState(() => _focused = _fn.hasFocus));
    _ctrl = widget.controller ?? TextEditingController();
    _ctrl.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _fn.dispose();
    if (widget.controller == null) _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final hasError = (widget.errorText ?? '').isNotEmpty;
    final length = _ctrl.text.length;
    final counterOverLimit = widget.maxLength != null && length >= widget.maxLength!;

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
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(OrigonRadius.sm),
            border: Border.all(color: borderColor, width: 1),
          ),
          padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.md, vertical: OrigonSpacing.sm),
          child: TextField(
            focusNode: _fn,
            controller: _ctrl,
            enabled: widget.enabled,
            minLines: widget.rows,
            maxLines: widget.autoResize ? widget.maxRows : widget.rows,
            maxLength: widget.maxLength,
            onChanged: widget.onChanged,
            style: TextStyle(
              color: widget.enabled ? theme.semantic.text.focus : theme.semantic.text.disable,
              fontFamily: OrigonFont.primary,
              fontSize: 15,
              height: 20 / 15,
            ),
            decoration: InputDecoration(
              isDense: true,
              counterText: '', // hide default counter
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
              hintText: widget.placeholder,
              hintStyle: TextStyle(color: theme.semantic.text.secondary),
            ),
          ),
        ),
        Padding(
          padding: EdgeInsets.only(top: OrigonSpacing.xxs, left: 2, right: 2),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  hasError ? widget.errorText! : widget.hint ?? '',
                  style: TextStyle(
                    color: hasError ? OrigonColors.red.s500 : theme.semantic.text.secondary,
                    fontFamily: OrigonFont.primary,
                    fontSize: 11,
                  ),
                ),
              ),
              if (widget.showCounter && widget.maxLength != null)
                Text(
                  '$length / ${widget.maxLength}',
                  style: TextStyle(
                    color: counterOverLimit ? OrigonColors.red.s500 : theme.semantic.text.secondary,
                    fontFamily: OrigonFont.primary,
                    fontSize: 11,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
