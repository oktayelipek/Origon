import SwiftUI
import OrigonTokens

/// Origon UI OrigonGauge — port of the React `<Gauge>`.
/// Source: Figma `- Gauge` (12:84862).

public enum OrigonGaugeTone {
    case neutral, success, warning, danger, brand

    func color(_ theme: OrigonThemeData) -> Color {
        switch self {
        case .neutral: return OrigonColors.blueGray.s500
        case .success: return OrigonColors.green.s600
        case .warning: return OrigonColors.amber.s500
        case .danger:  return OrigonColors.red.s600
        case .brand:   return theme.semantic.button.primary
        }
    }
}

public struct OrigonGauge: View {
    @Environment(\.origonTheme) private var theme
    let value: Double
    let size: CGFloat
    let tone: OrigonGaugeTone
    let showLabel: Bool

    public init(value: Double, size: CGFloat = 44, tone: OrigonGaugeTone = .neutral, showLabel: Bool = true) {
        self.value = value
        self.size = size
        self.tone = tone
        self.showLabel = showLabel
    }

    public var body: some View {
        let clamped = min(max(value, 0), 100)
        let stroke = max(2, size / 12)
        let color = tone.color(theme)
        return ZStack {
            Circle()
                .stroke(OrigonColors.blueGray.s300, lineWidth: stroke)
            Circle()
                .trim(from: 0, to: CGFloat(clamped / 100))
                .stroke(color, style: StrokeStyle(lineWidth: stroke, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.26), value: clamped)
            if showLabel {
                Text("%\(Int(clamped.rounded()))")
                    .foregroundColor(color)
                    .font(.system(size: max(9, size / 4), weight: .medium))
            }
        }
        .frame(width: size, height: size)
        .accessibilityLabel("\(Int(clamped.rounded())) percent")
    }
}
