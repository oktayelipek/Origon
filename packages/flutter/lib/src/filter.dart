import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonFilter — filter pill port.
/// Source: Figma `Header Filter` / `Header Filter [Icons]` (12:84954).

class OrigonFilter extends StatelessWidget {
  final String label;
  final Widget? value;
  final VoidCallback? onTap;
  final VoidCallback? onDismiss;
  final List<Widget>? leadingIcons;
  final bool enabled;

  const OrigonFilter({
    super.key,
    required this.label,
    this.value,
    this.onTap,
    this.onDismiss,
    this.leadingIcons,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final bg = enabled ? OrigonColors.blueGray.s200 : OrigonColors.blueGray.s100;
    final fg = enabled ? theme.semantic.text.focus : theme.semantic.text.disable;

    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        height: 30,
        padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.sm),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(OrigonRadius.xxl)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('$label:', style: TextStyle(color: theme.semantic.text.secondary, fontFamily: OrigonFont.primary, fontSize: 11, fontWeight: OrigonFont.medium)),
            SizedBox(width: OrigonSpacing.xs),
            if (leadingIcons != null)
              SizedBox(
                height: 16,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: List.generate(leadingIcons!.length, (i) {
                    return Positioned(
                      left: (i * 10).toDouble(),
                      child: Container(
                        width: 16, height: 16,
                        decoration: BoxDecoration(shape: BoxShape.circle, color: bg, border: Border.all(color: bg, width: 1)),
                        clipBehavior: Clip.antiAlias,
                        child: leadingIcons![i],
                      ),
                    );
                  }),
                ),
              ),
            if (leadingIcons != null) SizedBox(width: (leadingIcons!.length * 10) + 6.0),
            if (value != null) ...[
              DefaultTextStyle.merge(
                style: TextStyle(color: fg, fontFamily: OrigonFont.primary, fontSize: 11, fontWeight: OrigonFont.medium),
                child: value!,
              ),
              SizedBox(width: OrigonSpacing.xs),
            ],
            if (onDismiss != null)
              GestureDetector(
                onTap: onDismiss,
                child: Icon(Icons.cancel, size: 14, color: theme.semantic.text.secondary),
              )
            else
              Icon(Icons.keyboard_arrow_down, size: 14, color: theme.semantic.text.secondary),
          ],
        ),
      ),
    );
  }
}

class OrigonSortFilter extends StatelessWidget {
  final String label;
  final String? direction; // 'asc' | 'desc' | null
  final VoidCallback? onTap;

  const OrigonSortFilter({super.key, required this.label, this.direction, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    IconData icon;
    switch (direction) {
      case 'asc':  icon = Icons.arrow_upward; break;
      case 'desc': icon = Icons.arrow_downward; break;
      default:     icon = Icons.unfold_more;
    }
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 30,
        padding: EdgeInsets.symmetric(horizontal: OrigonSpacing.sm),
        decoration: BoxDecoration(color: OrigonColors.blueGray.s200, borderRadius: BorderRadius.circular(OrigonRadius.xxl)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: theme.semantic.text.focus),
            SizedBox(width: OrigonSpacing.xxs),
            Text(label, style: TextStyle(color: theme.semantic.text.focus, fontFamily: OrigonFont.primary, fontSize: 11, fontWeight: OrigonFont.medium)),
            SizedBox(width: OrigonSpacing.xxs),
            Icon(Icons.keyboard_arrow_down, size: 12, color: theme.semantic.text.secondary),
          ],
        ),
      ),
    );
  }
}
