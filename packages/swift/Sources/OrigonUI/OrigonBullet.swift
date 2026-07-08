import SwiftUI
import OrigonTokens

/// Origon UI OrigonBullet — step indicator port.
/// Source: Figma `Bullet [Line]` (8:837) and `Bullet [Dots]` (8:866).

public enum OrigonBulletVariant {
    case line, dots
}

public struct OrigonBullet: View {
    @Environment(\.origonTheme) private var theme
    let count: Int
    let active: Int
    let variant: OrigonBulletVariant

    public init(count: Int, active: Int, variant: OrigonBulletVariant = .dots) {
        self.count = count
        self.active = active
        self.variant = variant
    }

    public var body: some View {
        let dim: CGSize = variant == .line ? CGSize(width: 40, height: 4) : CGSize(width: 8, height: 8)
        return HStack(spacing: OrigonSpacing.xs) {
            ForEach(0..<count, id: \.self) { i in
                RoundedRectangle(cornerRadius: OrigonRadius.xxl)
                    .fill(i == active ? theme.semantic.text.focus : OrigonColors.blueGray.s300)
                    .frame(width: dim.width, height: dim.height)
                    .animation(.easeInOut(duration: 0.16), value: active)
            }
        }
        .accessibilityLabel("Step \(active + 1) of \(count)")
    }
}
