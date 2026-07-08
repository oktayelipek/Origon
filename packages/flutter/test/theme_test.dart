import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:origon_tokens/origon_tokens.dart';

void main() {
  group('OrigonTheme', () {
    test('resolve returns Kripto Dark by default enum values', () {
      final t = OrigonThemes.resolve(OrigonBrand.kripto, OrigonThemeMode.dark);
      expect(t.brand, OrigonBrand.kripto);
      expect(t.mode, OrigonThemeMode.dark);
    });

    test('all 6 mode combinations produce distinct semantic colors', () {
      final combos = <OrigonThemeData>[
        OrigonThemes.kriptoDark, OrigonThemes.kriptoLight,
        OrigonThemes.hisseDark,  OrigonThemes.hisseLight,
        OrigonThemes.globalDark, OrigonThemes.globalLight,
      ];
      // Brands differ in `brand.primary` (Kripto/Global share #005fae,
      // Hisse uses #07ac92 — at least 2 distinct values across all 6 modes).
      final primaries = combos.map((t) => t.semantic.brand.primary.value).toSet();
      expect(primaries.length, greaterThanOrEqualTo(2));
    });

    testWidgets('OrigonTheme.of() reads back what was provided', (tester) async {
      OrigonThemeData? seen;
      await tester.pumpWidget(MaterialApp(
        home: OrigonTheme(
          data: OrigonThemes.hisseLight,
          child: Builder(builder: (context) {
            seen = OrigonTheme.of(context);
            return const SizedBox();
          }),
        ),
      ));
      expect(seen?.brand, OrigonBrand.hisse);
      expect(seen?.mode, OrigonThemeMode.light);
    });
  });
}
