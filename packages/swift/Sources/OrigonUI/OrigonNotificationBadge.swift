import SwiftUI
import OrigonTokens

/// Origon UI OrigonNotificationBadge — dot/count overlay.
/// Source: Figma `- Notification Badge` (12:55791).

public enum OrigonBadgeTone { case brand, success, warning, danger }

public struct OrigonNotificationBadge<Content: View>: View {
    @Environment(\.origonTheme) private var theme
    let content: Content
    let count: Int?
    let text: String?
    let dot: Bool
    let max: Int
    let showZero: Bool
    let tone: OrigonBadgeTone

    public init(
        count: Int? = nil,
        text: String? = nil,
        dot: Bool = false,
        max: Int = 99,
        showZero: Bool = false,
        tone: OrigonBadgeTone = .danger,
        @ViewBuilder content: () -> Content
    ) {
        self.count = count
        self.text = text
        self.dot = dot
        self.max = max
        self.showZero = showZero
        self.tone = tone
        self.content = content()
    }

    private var shouldShow: Bool {
        if dot || showZero { return true }
        if let t = text, !t.isEmpty { return true }
        if let c = count, c > 0 { return true }
        return false
    }

    private var display: String {
        if dot { return "" }
        if let t = text { return t }
        if let c = count { return c > max ? "\(max)+" : "\(c)" }
        return ""
    }

    private var accent: Color {
        switch tone {
        case .brand:   return theme.semantic.button.primary
        case .success: return OrigonColors.green.s600
        case .warning: return OrigonColors.amber.s500
        case .danger:  return OrigonColors.red.s600
        }
    }

    public var body: some View {
        content.overlay(alignment: .topTrailing) {
            if shouldShow {
                Group {
                    if dot {
                        Circle()
                            .fill(accent)
                            .frame(width: 8, height: 8)
                            .overlay(Circle().stroke(OrigonColors.blueGray.s100, lineWidth: 2))
                    } else {
                        Text(display)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(OrigonColors.white)
                            .padding(.horizontal, 5)
                            .frame(minWidth: 18, minHeight: 18)
                            .background(accent)
                            .clipShape(Capsule())
                            .overlay(Capsule().stroke(OrigonColors.blueGray.s100, lineWidth: 2))
                    }
                }
                .offset(x: dot ? 2 : 6, y: dot ? -2 : -6)
            }
        }
    }
}
