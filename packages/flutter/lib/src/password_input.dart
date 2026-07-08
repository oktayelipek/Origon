import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';
import 'input.dart';

enum OrigonPasswordStrength { weak, middle, strong }

/// Default scorer: length + character-class combinations.
OrigonPasswordStrength _defaultScore(String v) {
  var score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (RegExp(r'[A-Z]').hasMatch(v) && RegExp(r'[a-z]').hasMatch(v)) score++;
  if (RegExp(r'\d').hasMatch(v)) score++;
  if (RegExp(r'[^A-Za-z0-9]').hasMatch(v)) score++;
  return score <= 2 ? OrigonPasswordStrength.weak : score <= 3 ? OrigonPasswordStrength.middle : OrigonPasswordStrength.strong;
}

/// Origon UI OrigonPasswordInput — masked field with visibility toggle and
/// optional strength meter. Wraps [OrigonInput].
class OrigonPasswordInput extends StatefulWidget {
  final String? label;
  final String? hint;
  final String? errorText;
  final bool enabled;
  final bool showStrengthMeter;
  final OrigonPasswordStrength Function(String)? scoreStrength;
  final String? placeholder;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;

  const OrigonPasswordInput({
    super.key,
    this.label,
    this.hint,
    this.errorText,
    this.enabled = true,
    this.showStrengthMeter = false,
    this.scoreStrength,
    this.placeholder,
    this.controller,
    this.onChanged,
  });

  @override
  State<OrigonPasswordInput> createState() => _OrigonPasswordInputState();
}

class _OrigonPasswordInputState extends State<OrigonPasswordInput> {
  bool _visible = false;
  late final TextEditingController _internal;

  @override
  void initState() {
    super.initState();
    _internal = widget.controller ?? TextEditingController();
    _internal.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    if (widget.controller == null) _internal.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final value = _internal.text;
    final scorer = widget.scoreStrength ?? _defaultScore;
    final strength = value.isEmpty ? null : scorer(value);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        OrigonInput(
          controller: _internal,
          onChanged: (v) => widget.onChanged?.call(v),
          label: widget.label,
          hint: widget.showStrengthMeter && value.isNotEmpty ? null : widget.hint,
          errorText: widget.errorText,
          enabled: widget.enabled,
          placeholder: widget.placeholder,
          rightIcon: IconButton(
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
            iconSize: 20,
            icon: Icon(_visible ? Icons.visibility_off_outlined : Icons.visibility_outlined),
            tooltip: _visible ? 'Hide password' : 'Show password',
            onPressed: () => setState(() => _visible = !_visible),
          ),
        ),
        if (widget.showStrengthMeter && strength != null)
          _StrengthMeter(strength: strength, theme: theme),
      ],
    );
  }
}

class _StrengthMeter extends StatelessWidget {
  final OrigonPasswordStrength strength;
  final OrigonThemeData theme;
  const _StrengthMeter({required this.strength, required this.theme});

  @override
  Widget build(BuildContext context) {
    final filled = strength == OrigonPasswordStrength.weak ? 1
                 : strength == OrigonPasswordStrength.middle ? 2
                 : 3;
    final color = strength == OrigonPasswordStrength.weak ? OrigonColors.red.s500
                : strength == OrigonPasswordStrength.middle ? OrigonColors.amber.s500
                : OrigonColors.green.s600;
    final label = strength == OrigonPasswordStrength.weak ? 'Weak'
                : strength == OrigonPasswordStrength.middle ? 'Medium'
                : 'Strong';

    return Padding(
      padding: EdgeInsets.only(top: OrigonSpacing.xxs, left: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < 3; i++) ...[
            if (i > 0) const SizedBox(width: 4),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24, height: 4,
              decoration: BoxDecoration(
                color: i < filled ? color : OrigonColors.blueGray.s300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ],
          SizedBox(width: OrigonSpacing.xs),
          Text(
            label,
            style: TextStyle(color: color, fontFamily: OrigonFont.primary, fontSize: 11, fontWeight: OrigonFont.medium),
          ),
        ],
      ),
    );
  }
}
