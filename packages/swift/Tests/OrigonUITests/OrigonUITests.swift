import XCTest
import SwiftUI
@testable import OrigonUI
import OrigonTokens

final class OrigonUITests: XCTestCase {

    func testButtonInitTextConvenience() {
        // Text-only convenience init compiles and produces a view.
        let b = OrigonButton("Buy", action: {})
        XCTAssertNotNil(b.body)
    }

    func testButtonSizeSpecsCover3Sizes() {
        XCTAssertGreaterThan(OrigonButtonSize.large.spec.height, OrigonButtonSize.medium.spec.height)
        XCTAssertGreaterThan(OrigonButtonSize.medium.spec.height, OrigonButtonSize.small.spec.height)
    }

    func testGaugeToneColorAllCases() {
        let theme = OrigonThemes.kriptoDark
        for tone in [OrigonGaugeTone.neutral, .success, .warning, .danger, .brand] {
            _ = tone.color(theme)
        }
    }

    func testPasswordStrengthScorer() {
        XCTAssertEqual(OrigonPasswordStrength.score(""), .weak)
        XCTAssertEqual(OrigonPasswordStrength.score("abc"), .weak)
        XCTAssertEqual(OrigonPasswordStrength.score("Abcdef12"), .middle)
        XCTAssertEqual(OrigonPasswordStrength.score("Abcdef12!@"), .strong)
    }

    func testChipInits() {
        _ = OrigonChip(size: .md, variant: .solid) { Text("Static") }
        _ = OrigonChip(selected: .constant(true)) { Text("Toggle") }
    }

    func testTicker() {
        let ticker = OrigonTicker(items: [
            OrigonTickerItem(id: "a") { Text("A") },
            OrigonTickerItem(id: "b") { Text("B") },
        ], duration: 10)
        XCTAssertNotNil(ticker.body)
    }
}
