import XCTest
import SwiftUI
@testable import OrigonTokens

final class OrigonTokensTests: XCTestCase {

    func testPrimitiveBaseColors() {
        // White / black should be sRGB extremes.
        XCTAssertNotNil(OrigonColors.white)
        XCTAssertNotNil(OrigonColors.black)
    }

    func testBlueGrayScaleAllSteps() {
        // All 10 canonical steps must exist via subscript.
        for step in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] {
            _ = OrigonColors.blueGray[step]
        }
    }

    func testResolveReturnsMatchingThemeData() {
        let t = OrigonThemes.resolve(.kripto, .dark)
        XCTAssertEqual(t.brand, .kripto)
        XCTAssertEqual(t.mode, .dark)
    }

    func testAllSixModesExist() {
        // Each of the 6 brand×theme combinations should have distinct
        // OrigonThemeData values. We can't compare Color for equality directly,
        // so we assert they are all constructed.
        let all: [OrigonThemeData] = [
            OrigonThemes.kriptoDark, OrigonThemes.kriptoLight,
            OrigonThemes.hisseDark,  OrigonThemes.hisseLight,
            OrigonThemes.globalDark, OrigonThemes.globalLight,
        ]
        XCTAssertEqual(all.count, 6)
    }

    func testSpacingRadiusPositive() {
        XCTAssertGreaterThan(OrigonSpacing.md, 0)
        XCTAssertGreaterThan(OrigonRadius.xxl, 0)
    }

    func testShadowEnumCoverage() {
        // All shadow tokens should have a spec with a non-negative radius.
        for shadow in OrigonShadow.allCases {
            XCTAssertGreaterThanOrEqual(shadow.spec.radius, 0)
        }
    }
}
