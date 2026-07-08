import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI showOrigonDrawer — port of the React `<Drawer>` as a show-fn.
/// Uses Flutter's built-in modal bottom sheet / side sheet.
/// Source: Figma `- Drawer` (12:86222).

enum OrigonDrawerSide { bottom, right }

Future<T?> showOrigonDrawer<T>({
  required BuildContext context,
  required Widget child,
  OrigonDrawerSide side = OrigonDrawerSide.bottom,
  bool showHandle = true,
  String? semanticLabel,
}) {
  if (side == OrigonDrawerSide.bottom) {
    return showModalBottomSheet<T>(
      context: context,
      backgroundColor: OrigonColors.blueGray.s100,
      barrierColor: Colors.black.withOpacity(0.6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(OrigonRadius.xxl)),
      ),
      isScrollControlled: true,
      builder: (_) => Semantics(
        label: semanticLabel,
        namesRoute: true,
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (showHandle)
                  Padding(
                    padding: EdgeInsets.only(top: OrigonSpacing.sm, bottom: OrigonSpacing.xxs),
                    child: Container(
                      width: 40, height: 4,
                      decoration: BoxDecoration(color: OrigonColors.blueGray.s400, borderRadius: BorderRadius.circular(OrigonRadius.xxl)),
                    ),
                  ),
                Padding(padding: EdgeInsets.all(OrigonSpacing.md), child: child),
              ],
            ),
          ),
        ),
      ),
    );
  }
  // Right side sheet.
  return showGeneralDialog<T>(
    context: context,
    barrierColor: Colors.black.withOpacity(0.6),
    barrierDismissible: true,
    barrierLabel: semanticLabel ?? 'Drawer',
    transitionDuration: const Duration(milliseconds: 220),
    pageBuilder: (_, __, ___) => Align(
      alignment: Alignment.centerRight,
      child: Material(
        color: OrigonColors.blueGray.s100,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(OrigonRadius.xxl),
          bottomLeft: Radius.circular(OrigonRadius.xxl),
        ),
        child: SizedBox(
          width: 400,
          height: double.infinity,
          child: Padding(padding: EdgeInsets.all(OrigonSpacing.md), child: child),
        ),
      ),
    ),
    transitionBuilder: (_, anim, __, child) => SlideTransition(
      position: Tween(begin: const Offset(1, 0), end: Offset.zero).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
      child: child,
    ),
  );
}
