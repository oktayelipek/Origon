import 'package:flutter_test/flutter_test.dart';
import 'package:origon_tokens/origon_tokens.dart';

void main() {
  group('primitives', () {
    test('white / black are the standard sRGB values', () {
      expect(OrigonColors.white.value, 0xFFFFFFFF);
      expect(OrigonColors.black.value, 0xFF000000);
    });

    test('blueGray scale is 10 steps 50..900', () {
      // Ensure `[step]` subscript works for all canonical steps.
      for (final s in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
        expect(OrigonColors.blueGray[s].value, greaterThan(0));
      }
    });

    test('OrigonRadius / OrigonSpacing constants are non-negative', () {
      expect(OrigonRadius.xxl, greaterThan(0));
      expect(OrigonSpacing.md, greaterThan(0));
    });
  });

  group('shadow', () {
    test('OrigonShadow.xl is a proper BoxShadow', () {
      expect(OrigonShadow.xl, isNotNull);
      expect(OrigonShadow.xl.blurRadius, greaterThan(0));
    });
  });
}
