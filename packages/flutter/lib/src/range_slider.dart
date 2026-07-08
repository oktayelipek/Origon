import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonRangeSlider — wrapper around Material's Slider/RangeSlider
/// with Origon theming. For single-thumb use [OrigonRangeSlider.single], for
/// dual pass [start] and [end].
/// Source: Figma `- Range Selector` (12:54109).

class OrigonRangeSlider extends StatelessWidget {
  final double? value; // single
  final RangeValues? values; // dual
  final ValueChanged<double>? onSingle;
  final ValueChanged<RangeValues>? onDual;
  final double min;
  final double max;
  final int? divisions;
  final bool enabled;
  final String? label;

  const OrigonRangeSlider.single({
    super.key,
    required this.value,
    required this.onSingle,
    this.min = 0,
    this.max = 100,
    this.divisions,
    this.enabled = true,
    this.label,
  })  : values = null,
        onDual = null;

  const OrigonRangeSlider.dual({
    super.key,
    required this.values,
    required this.onDual,
    this.min = 0,
    this.max = 100,
    this.divisions,
    this.enabled = true,
    this.label,
  })  : value = null,
        onSingle = null;

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final primary = theme.semantic.button.primary;

    final sliderTheme = SliderThemeData(
      activeTrackColor: enabled ? primary : OrigonColors.blueGray.s500,
      inactiveTrackColor: OrigonColors.blueGray.s300,
      thumbColor: OrigonColors.white,
      overlayColor: primary.withOpacity(0.15),
      trackHeight: 6,
      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 9),
      rangeThumbShape: const RoundRangeSliderThumbShape(enabledThumbRadius: 9),
    );

    final slider = values != null
        ? RangeSlider(
            values: values!,
            min: min, max: max, divisions: divisions,
            onChanged: enabled ? onDual : null,
            activeColor: primary,
            inactiveColor: OrigonColors.blueGray.s300,
          )
        : Slider(
            value: value!,
            min: min, max: max, divisions: divisions,
            onChanged: enabled ? onSingle : null,
            activeColor: primary,
            inactiveColor: OrigonColors.blueGray.s300,
          );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null)
          Padding(
            padding: EdgeInsets.only(bottom: OrigonSpacing.xs, left: 2),
            child: Text(
              label!,
              style: TextStyle(color: theme.semantic.text.secondary, fontFamily: OrigonFont.primary, fontSize: 11, fontWeight: OrigonFont.medium),
            ),
          ),
        SliderTheme(data: sliderTheme, child: slider),
      ],
    );
  }
}
