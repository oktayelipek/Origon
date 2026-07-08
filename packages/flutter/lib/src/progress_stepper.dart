import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonProgressStepper — numbered dots + connecting lines.
/// Source: Figma `- Progress Stepper` (12:54443).

enum OrigonStepperOrientation { horizontal, vertical }

class OrigonStep {
  final Widget? label;
  final Widget? description;
  const OrigonStep({this.label, this.description});
}

class OrigonProgressStepper extends StatelessWidget {
  final List<OrigonStep> steps;
  final int active;
  final List<int>? completed;
  final OrigonStepperOrientation orientation;

  const OrigonProgressStepper({
    super.key,
    required this.steps,
    required this.active,
    this.completed,
    this.orientation = OrigonStepperOrientation.horizontal,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final doneSet = (completed ?? List.generate(steps.length, (i) => i).where((i) => i < active).toList()).toSet();
    final primary = theme.semantic.button.primary;
    final isHorizontal = orientation == OrigonStepperOrientation.horizontal;

    final children = <Widget>[];
    for (var i = 0; i < steps.length; i++) {
      final isDone = doneSet.contains(i);
      final isActive = i == active;
      final isLast = i == steps.length - 1;

      Widget dot = AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 24, height: 24,
        decoration: BoxDecoration(
          color: isDone || isActive ? primary : OrigonColors.blueGray.s300,
          shape: BoxShape.circle,
          border: Border.all(color: isDone || isActive ? primary : OrigonColors.blueGray.s400, width: 1),
        ),
        alignment: Alignment.center,
        child: isDone
            ? Icon(Icons.check, size: 14, color: OrigonColors.white)
            : Text(
                '${i + 1}',
                style: TextStyle(
                  color: isDone || isActive ? OrigonColors.white : theme.semantic.text.secondary,
                  fontFamily: OrigonFont.primary,
                  fontSize: 11,
                  fontWeight: OrigonFont.medium,
                ),
              ),
      );

      final line = isLast ? const SizedBox.shrink() : Expanded(
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: isHorizontal ? 2 : null,
          width: isHorizontal ? null : 2,
          margin: isHorizontal
              ? const EdgeInsets.symmetric(horizontal: 4)
              : const EdgeInsets.symmetric(vertical: 4),
          color: isDone ? primary : OrigonColors.blueGray.s300,
        ),
      );

      final trackRow = isHorizontal
          ? Row(children: [dot, line])
          : Column(mainAxisSize: MainAxisSize.min, children: [dot, line]);

      final labelBlock = (steps[i].label != null || steps[i].description != null)
          ? Padding(
              padding: isHorizontal ? EdgeInsets.only(top: OrigonSpacing.xxs) : EdgeInsets.only(left: OrigonSpacing.sm),
              child: Column(
                crossAxisAlignment: isHorizontal ? CrossAxisAlignment.center : CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (steps[i].label != null)
                    DefaultTextStyle.merge(
                      style: TextStyle(
                        color: isDone || isActive ? theme.semantic.text.focus : theme.semantic.text.secondary,
                        fontFamily: OrigonFont.primary,
                        fontSize: 13,
                        fontWeight: OrigonFont.medium,
                      ),
                      child: steps[i].label!,
                    ),
                  if (steps[i].description != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: DefaultTextStyle.merge(
                        style: TextStyle(color: theme.semantic.text.secondary, fontFamily: OrigonFont.primary, fontSize: 11),
                        child: steps[i].description!,
                      ),
                    ),
                ],
              ),
            )
          : const SizedBox.shrink();

      children.add(Semantics(
        label: 'Step ${i + 1} of ${steps.length}',
        currentValueLength: isActive ? 1 : 0,
        child: Expanded(
          child: isHorizontal
              ? Column(mainAxisSize: MainAxisSize.min, children: [trackRow, labelBlock])
              : Row(children: [trackRow, if (labelBlock is! SizedBox) Expanded(child: labelBlock)]),
        ),
      ));
    }

    return isHorizontal
        ? Row(children: children)
        : Column(mainAxisSize: MainAxisSize.min, children: children);
  }
}
