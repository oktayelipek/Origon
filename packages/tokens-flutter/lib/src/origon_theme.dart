import 'package:flutter/widgets.dart';
import '../generated/origon_themes.dart';

/// [OrigonTheme] provides the active [OrigonThemeData] to descendants.
/// Look up via `OrigonTheme.of(context)`.
///
/// Wrap your app:
///
///     MaterialApp(
///       builder: (_, child) => OrigonTheme(
///         data: OrigonThemes.kriptoDark,
///         child: child!,
///       ),
///     );
class OrigonTheme extends InheritedWidget {
  final OrigonThemeData data;

  const OrigonTheme({
    super.key,
    required this.data,
    required super.child,
  });

  static OrigonThemeData of(BuildContext context) {
    final inherited = context.dependOnInheritedWidgetOfExactType<OrigonTheme>();
    return inherited?.data ?? OrigonThemes.kriptoDark;
  }

  static OrigonThemeData? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<OrigonTheme>()?.data;
  }

  @override
  bool updateShouldNotify(OrigonTheme old) => old.data != data;
}
