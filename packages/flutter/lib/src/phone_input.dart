import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonPhoneInput — country picker + national number.
/// Source: Figma FKInput Feature=Phone (12:68514).

class OrigonPhoneCountry {
  final String code;
  final String dial;
  final String flag;
  final String name;
  const OrigonPhoneCountry({required this.code, required this.dial, required this.flag, required this.name});
}

const List<OrigonPhoneCountry> _countries = [
  OrigonPhoneCountry(code: 'TR', dial: '+90',  flag: '🇹🇷', name: 'Türkiye'),
  OrigonPhoneCountry(code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Deutschland'),
  OrigonPhoneCountry(code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'France'),
  OrigonPhoneCountry(code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'United Kingdom'),
  OrigonPhoneCountry(code: 'US', dial: '+1',   flag: '🇺🇸', name: 'United States'),
  OrigonPhoneCountry(code: 'JP', dial: '+81',  flag: '🇯🇵', name: 'Japan'),
  OrigonPhoneCountry(code: 'RU', dial: '+7',   flag: '🇷🇺', name: 'Russia'),
  OrigonPhoneCountry(code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE'),
];

class OrigonPhoneInput extends StatefulWidget {
  final String value;
  final ValueChanged<String>? onChanged;
  final String countryCode;
  final ValueChanged<String>? onCountryCodeChange;
  final String? label;
  final String? hint;
  final String? errorText;
  final bool enabled;
  final String? placeholder;

  const OrigonPhoneInput({
    super.key,
    this.value = '',
    this.onChanged,
    this.countryCode = 'TR',
    this.onCountryCodeChange,
    this.label,
    this.hint,
    this.errorText,
    this.enabled = true,
    this.placeholder = '5xx xxx xx xx',
  });

  @override
  State<OrigonPhoneInput> createState() => _OrigonPhoneInputState();
}

class _OrigonPhoneInputState extends State<OrigonPhoneInput> {
  bool _focused = false;
  late final FocusNode _fn;
  late final TextEditingController _ctrl;

  @override
  void initState() {
    super.initState();
    _fn = FocusNode()..addListener(() => setState(() => _focused = _fn.hasFocus));
    _ctrl = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(OrigonPhoneInput old) {
    super.didUpdateWidget(old);
    if (widget.value != _ctrl.text) _ctrl.text = widget.value;
  }

  @override
  void dispose() {
    _fn.dispose();
    _ctrl.dispose();
    super.dispose();
  }

  OrigonPhoneCountry get _country =>
      _countries.firstWhere((c) => c.code == widget.countryCode, orElse: () => _countries.first);

  void _pickCountry(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => ListView.builder(
        itemCount: _countries.length,
        itemBuilder: (_, i) {
          final c = _countries[i];
          return ListTile(
            leading: Text(c.flag, style: const TextStyle(fontSize: 20)),
            title: Text(c.name),
            trailing: Text(c.dial),
            selected: c.code == widget.countryCode,
            onTap: () {
              widget.onCountryCodeChange?.call(c.code);
              Navigator.of(context).pop();
            },
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final hasError = (widget.errorText ?? '').isNotEmpty;
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
        Row(
          children: [
            InkWell(
              onTap: widget.enabled ? () => _pickCountry(context) : null,
              borderRadius: BorderRadius.circular(OrigonRadius.sm),
              child: Container(
                height: 54,
                padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.md),
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(OrigonRadius.sm),
                ),
                child: Row(
                  children: [
                    Text(_country.flag, style: const TextStyle(fontSize: 20)),
                    SizedBox(width: OrigonSpacing.xs),
                    Text(
                      _country.dial,
                      style: TextStyle(
                        color: theme.semantic.text.focus,
                        fontFamily: OrigonFont.primary,
                        fontSize: 15,
                      ),
                    ),
                    Icon(Icons.keyboard_arrow_down, size: 14, color: theme.semantic.text.secondary),
                  ],
                ),
              ),
            ),
            SizedBox(width: OrigonSpacing.xs),
            Expanded(
              child: Container(
                height: 54,
                padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.md),
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(OrigonRadius.sm),
                  border: Border.all(color: borderColor, width: 1),
                ),
                child: TextField(
                  focusNode: _fn,
                  controller: _ctrl,
                  enabled: widget.enabled,
                  keyboardType: TextInputType.phone,
                  onChanged: (v) {
                    final sanitized = v.replaceAll(RegExp(r'[^\d ]'), '');
                    if (sanitized != v) {
                      _ctrl.value = TextEditingValue(text: sanitized, selection: TextSelection.collapsed(offset: sanitized.length));
                    }
                    widget.onChanged?.call(sanitized);
                  },
                  decoration: InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                    hintText: widget.placeholder,
                    hintStyle: TextStyle(color: theme.semantic.text.secondary),
                  ),
                  style: TextStyle(
                    color: widget.enabled ? theme.semantic.text.focus : theme.semantic.text.disable,
                    fontFamily: OrigonFont.primary,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
          ],
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
