import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonPinInput — segmented digit boxes (2FA / PIN entry).
/// Source: Figma FKInput Feature=Numeric / Encrypted (12:68514).

class OrigonPinInput extends StatefulWidget {
  final int length;
  final String value;
  final ValueChanged<String> onChanged;
  final ValueChanged<String>? onComplete;
  final bool enabled;
  final bool autoFocus;
  final bool mask;
  final String? errorText;
  final String? label;

  const OrigonPinInput({
    super.key,
    this.length = 6,
    required this.value,
    required this.onChanged,
    this.onComplete,
    this.enabled = true,
    this.autoFocus = false,
    this.mask = false,
    this.errorText,
    this.label,
  }) : assert(length == 4 || length == 6, 'length must be 4 or 6');

  @override
  State<OrigonPinInput> createState() => _OrigonPinInputState();
}

class _OrigonPinInputState extends State<OrigonPinInput> {
  late final List<FocusNode> _nodes;
  late final List<TextEditingController> _ctrls;

  @override
  void initState() {
    super.initState();
    _nodes = List.generate(widget.length, (_) => FocusNode());
    _ctrls = List.generate(widget.length, (i) {
      final v = i < widget.value.length ? widget.value[i] : '';
      return TextEditingController(text: v);
    });
    if (widget.autoFocus) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _nodes[0].requestFocus());
    }
  }

  @override
  void didUpdateWidget(OrigonPinInput old) {
    super.didUpdateWidget(old);
    if (widget.value != old.value) {
      for (var i = 0; i < widget.length; i++) {
        final ch = i < widget.value.length ? widget.value[i] : '';
        if (_ctrls[i].text != ch) _ctrls[i].text = ch;
      }
    }
  }

  @override
  void dispose() {
    for (final n in _nodes) n.dispose();
    for (final c in _ctrls) c.dispose();
    super.dispose();
  }

  void _setChar(int i, String ch) {
    final chars = List.filled(widget.length, '');
    for (var k = 0; k < widget.length; k++) {
      chars[k] = k < widget.value.length ? widget.value[k] : '';
    }
    chars[i] = ch;
    final next = chars.join();
    widget.onChanged(next);
    if (next.length == widget.length && !next.contains('')) {
      widget.onComplete?.call(next);
    }
  }

  void _handle(int i, String v) {
    if (v.isEmpty) { _setChar(i, ''); return; }
    // Paste of full code — Flutter reports it as one big value on the first box.
    if (v.length > 1) {
      final digits = v.replaceAll(RegExp(r'\D'), '').substring(0, v.length.clamp(0, widget.length - i));
      final chars = List.filled(widget.length, '');
      for (var k = 0; k < widget.length; k++) {
        chars[k] = k < widget.value.length ? widget.value[k] : '';
      }
      for (var k = 0; k < digits.length && (i + k) < widget.length; k++) {
        chars[i + k] = digits[k];
      }
      final next = chars.join();
      widget.onChanged(next);
      for (var k = 0; k < widget.length; k++) _ctrls[k].text = chars[k];
      final focusIndex = (i + digits.length).clamp(0, widget.length - 1);
      _nodes[focusIndex].requestFocus();
      if (next.length == widget.length && !next.contains('')) widget.onComplete?.call(next);
      return;
    }
    final digit = v.replaceAll(RegExp(r'\D'), '');
    if (digit.isEmpty) { _ctrls[i].text = ''; return; }
    _setChar(i, digit.characters.last);
    if (i < widget.length - 1) _nodes[i + 1].requestFocus();
  }

  bool _onKey(int i, KeyEvent event) {
    if (event is! KeyDownEvent) return false;
    if (event.logicalKey == LogicalKeyboardKey.backspace) {
      final ch = i < widget.value.length ? widget.value[i] : '';
      if (ch.isEmpty && i > 0) {
        _nodes[i - 1].requestFocus();
        _setChar(i - 1, '');
        _ctrls[i - 1].text = '';
      }
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final hasError = (widget.errorText ?? '').isNotEmpty;

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
                color: theme.semantic.text.secondary,
                fontFamily: OrigonFont.primary,
                fontSize: 11,
                fontWeight: OrigonFont.medium,
              ),
            ),
          ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < widget.length; i++) ...[
              if (i > 0) SizedBox(width: OrigonSpacing.xs),
              SizedBox(
                width: 46, height: 54,
                child: KeyboardListener(
                  focusNode: FocusNode(skipTraversal: true),
                  onKeyEvent: (e) => _onKey(i, e),
                  child: TextField(
                    focusNode: _nodes[i],
                    controller: _ctrls[i],
                    enabled: widget.enabled,
                    obscureText: widget.mask,
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    maxLength: 1,
                    style: TextStyle(
                      color: theme.semantic.text.focus,
                      fontFamily: OrigonFont.primary,
                      fontSize: 20,
                      fontWeight: OrigonFont.medium,
                    ),
                    onChanged: (v) => _handle(i, v),
                    decoration: InputDecoration(
                      counterText: '',
                      filled: true,
                      fillColor: (i < widget.value.length && widget.value[i].isNotEmpty)
                          ? OrigonColors.blueGray.s400
                          : OrigonColors.blueGray.s200,
                      contentPadding: EdgeInsets.zero,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(OrigonRadius.sm),
                        borderSide: BorderSide(
                          color: hasError ? OrigonColors.red.s600 : Colors.transparent,
                          width: 1,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(OrigonRadius.sm),
                        borderSide: BorderSide(
                          color: hasError ? OrigonColors.red.s600 : Colors.transparent,
                          width: 1,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(OrigonRadius.sm),
                        borderSide: BorderSide(color: OrigonColors.blueGray.s500, width: 1),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
        if (hasError)
          Padding(
            padding: EdgeInsets.only(top: OrigonSpacing.xxs, left: 2),
            child: Text(
              widget.errorText!,
              style: TextStyle(color: OrigonColors.red.s500, fontFamily: OrigonFont.primary, fontSize: 11),
            ),
          ),
      ],
    );
  }
}
