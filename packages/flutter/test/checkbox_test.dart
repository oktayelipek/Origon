import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:origon_ui/origon_ui.dart';
import 'package:origon_tokens/origon_tokens.dart';

Widget _wrap(Widget child) {
  return MaterialApp(
    home: OrigonTheme(
      data: OrigonThemes.kriptoDark,
      child: Scaffold(body: Center(child: child)),
    ),
  );
}

void main() {
  group('OrigonCheckbox', () {
    testWidgets('renders label', (tester) async {
      await tester.pumpWidget(_wrap(OrigonCheckbox(
        value: false,
        onChanged: (_) {},
        label: const Text('Agree'),
      )));
      expect(find.text('Agree'), findsOneWidget);
    });

    testWidgets('toggles via tap', (tester) async {
      bool? received;
      await tester.pumpWidget(_wrap(OrigonCheckbox(
        value: false,
        onChanged: (v) => received = v,
        label: const Text('X'),
      )));
      await tester.tap(find.text('X'));
      expect(received, true);
    });

    testWidgets('disabled onChanged is not fired', (tester) async {
      var fired = false;
      await tester.pumpWidget(_wrap(OrigonCheckbox(
        value: false,
        onChanged: (_) => fired = true,
        disabled: true,
        label: const Text('D'),
      )));
      await tester.tap(find.text('D'));
      expect(fired, false);
    });
  });
}
