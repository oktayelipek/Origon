import 'package:flutter/material.dart';

/// Origon UI OrigonIcon — starter icon set (line style, currentColor).
/// Source: Figma `- Icons + Logos` (12:73747). Full library export is a v2 task.

enum OrigonIconName {
  check, close, chevronDown, chevronRight,
  info, alert, star, search, plus, minus, arrowUp, arrowDown,
}

class OrigonIcon extends StatelessWidget {
  final OrigonIconName name;
  final double size;
  final Color? color;

  const OrigonIcon({super.key, required this.name, this.size = 20, this.color});

  IconData get _iconData {
    switch (name) {
      case OrigonIconName.check:         return Icons.check;
      case OrigonIconName.close:         return Icons.close;
      case OrigonIconName.chevronDown:   return Icons.keyboard_arrow_down;
      case OrigonIconName.chevronRight:  return Icons.keyboard_arrow_right;
      case OrigonIconName.info:          return Icons.info_outline;
      case OrigonIconName.alert:         return Icons.warning_amber_outlined;
      case OrigonIconName.star:          return Icons.star_border;
      case OrigonIconName.search:        return Icons.search;
      case OrigonIconName.plus:          return Icons.add;
      case OrigonIconName.minus:         return Icons.remove;
      case OrigonIconName.arrowUp:       return Icons.arrow_upward;
      case OrigonIconName.arrowDown:     return Icons.arrow_downward;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Icon(_iconData, size: size, color: color);
  }
}
