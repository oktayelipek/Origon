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
  group('OrigonButton', () {
    testWidgets('renders label', (tester) async {
      await tester.pumpWidget(_wrap(OrigonButton(child: const Text('Buy'), onPressed: () {})));
      expect(find.text('Buy'), findsOneWidget);
    });

    testWidgets('fires onPressed', (tester) async {
      var count = 0;
      await tester.pumpWidget(_wrap(OrigonButton(child: const Text('Click'), onPressed: () => count++)));
      await tester.tap(find.text('Click'));
      expect(count, 1);
    });

    testWidgets('does not fire when disabled (onPressed == null)', (tester) async {
      var count = 0;
      // Disabled = onPressed null.
      await tester.pumpWidget(_wrap(OrigonButton(child: const Text('X'), onPressed: null)));
      await tester.tap(find.text('X'));
      expect(count, 0);
    });

    testWidgets('vertical direction stacks icon above label', (tester) async {
      await tester.pumpWidget(_wrap(
        OrigonButton(
          child: const Text('Save'),
          icon: const Icon(Icons.check, key: Key('icon')),
          direction: OrigonButtonDirection.vertical,
          onPressed: () {},
        ),
      ));
      final iconFinder = find.byKey(const Key('icon'));
      final labelFinder = find.text('Save');
      expect(iconFinder, findsOneWidget);
      expect(labelFinder, findsOneWidget);
      final iconTop = tester.getTopLeft(iconFinder).dy;
      final labelTop = tester.getTopLeft(labelFinder).dy;
      expect(iconTop, lessThan(labelTop));
    });
  });
}
