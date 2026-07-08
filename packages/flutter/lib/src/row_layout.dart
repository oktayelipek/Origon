import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonListRow — data row composition.
/// Named to avoid clashing with Flutter's own `Row` widget.
/// Source: Figma `- Row` (12:51134) + `- Price Row` (12:54723).

enum OrigonRowMetaTone { defaultTone, success, danger }

class OrigonListRow extends StatelessWidget {
  final Widget? leading;
  final Widget title;
  final Widget? subtitle;
  final Widget? trailing;
  final Widget? meta;
  final Widget? metaSubtitle;
  final OrigonRowMetaTone metaTone;
  final VoidCallback? onTap;
  final bool dense;

  const OrigonListRow({
    super.key,
    required this.title,
    this.leading,
    this.subtitle,
    this.trailing,
    this.meta,
    this.metaSubtitle,
    this.metaTone = OrigonRowMetaTone.defaultTone,
    this.onTap,
    this.dense = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    final metaColor = metaTone == OrigonRowMetaTone.success
        ? OrigonColors.green.s600
        : metaTone == OrigonRowMetaTone.danger ? OrigonColors.red.s500
        : theme.semantic.text.secondary;

    final content = Row(
      children: [
        if (leading != null) ...[
          leading!,
          SizedBox(width: OrigonSpacing.sm),
        ],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              DefaultTextStyle.merge(
                style: TextStyle(
                  color: theme.semantic.text.focus,
                  fontFamily: OrigonFont.primary,
                  fontSize: 15,
                  fontWeight: OrigonFont.medium,
                ),
                overflow: TextOverflow.ellipsis,
                child: title,
              ),
              if (subtitle != null)
                DefaultTextStyle.merge(
                  style: TextStyle(
                    color: theme.semantic.text.secondary,
                    fontFamily: OrigonFont.primary,
                    fontSize: 13,
                  ),
                  overflow: TextOverflow.ellipsis,
                  child: subtitle!,
                ),
            ],
          ),
        ),
        if (meta != null || metaSubtitle != null) ...[
          SizedBox(width: OrigonSpacing.sm),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (meta != null)
                DefaultTextStyle.merge(
                  style: TextStyle(
                    color: theme.semantic.text.focus,
                    fontFamily: OrigonFont.primary,
                    fontSize: 15,
                    fontWeight: OrigonFont.medium,
                  ),
                  child: meta!,
                ),
              if (metaSubtitle != null)
                DefaultTextStyle.merge(
                  style: TextStyle(
                    color: metaColor,
                    fontFamily: OrigonFont.primary,
                    fontSize: 13,
                    fontWeight: OrigonFont.medium,
                  ),
                  child: metaSubtitle!,
                ),
            ],
          ),
        ],
        if (trailing != null) ...[
          SizedBox(width: OrigonSpacing.sm),
          IconTheme.merge(
            data: IconThemeData(color: theme.semantic.text.secondary, size: 20),
            child: trailing!,
          ),
        ],
      ],
    );

    final padded = Padding(
      padding: EdgeInsets.symmetric(
        horizontal: OrigonSpacing.md,
        vertical: dense ? OrigonSpacing.xs : OrigonSpacing.sm,
      ),
      child: content,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          hoverColor: OrigonColors.blueGray.s200,
          child: padded,
        ),
      );
    }
    return padded;
  }
}
