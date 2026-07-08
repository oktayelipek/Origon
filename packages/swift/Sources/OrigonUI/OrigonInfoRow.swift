import SwiftUI
import OrigonTokens

/// Origon UI OrigonInfoRow — port of the React `<InfoRow>`.
/// Source: Figma `FK-InfoRow` (12:73137).

public enum OrigonInfoRowTone { case info, focus, caution, warning }
public enum OrigonInfoRowPresence { case low, high }

public struct OrigonInfoRow<Icon: View>: View {
    @Environment(\.origonTheme) private var theme
    let message: String
    let tone: OrigonInfoRowTone
    let presence: OrigonInfoRowPresence
    let boxed: Bool
    let icon: Icon?
    let onDismiss: (() -> Void)?

    public init(
        message: String,
        tone: OrigonInfoRowTone = .info,
        presence: OrigonInfoRowPresence = .low,
        boxed: Bool = true,
        onDismiss: (() -> Void)? = nil,
        @ViewBuilder icon: () -> Icon
    ) {
        self.message = message
        self.tone = tone
        self.presence = presence
        self.boxed = boxed
        self.onDismiss = onDismiss
        self.icon = icon()
    }

    private var colors: (bg: Color, fg: Color, border: Color) {
        switch tone {
        case .info:
            return presence == .high
                ? (OrigonColors.blueGray.s300, theme.semantic.text.focus, OrigonColors.blueGray.s300)
                : (OrigonColors.blueGray.s200, theme.semantic.text.focus, OrigonColors.blueGray.s300)
        case .focus:
            return presence == .high
                ? (theme.semantic.button.primary, OrigonColors.white, theme.semantic.button.primary)
                : (theme.semantic.button.primary.opacity(0.12), theme.semantic.button.primary, theme.semantic.button.primary)
        case .caution:
            return presence == .high
                ? (OrigonColors.amber.s600, OrigonColors.blueGray.s50, OrigonColors.amber.s600)
                : (OrigonColors.amber.s600.opacity(0.14), OrigonColors.amber.s500, OrigonColors.amber.s600)
        case .warning:
            return presence == .high
                ? (OrigonColors.red.s600, OrigonColors.white, OrigonColors.red.s600)
                : (OrigonColors.red.s600.opacity(0.14), OrigonColors.red.s400, OrigonColors.red.s600)
        }
    }

    public var body: some View {
        let c = colors
        return HStack(spacing: OrigonSpacing.sm) {
            if let icon = icon {
                icon.frame(width: 20, height: 20).foregroundColor(c.fg)
            }
            Text(message)
                .foregroundColor(c.fg)
                .font(.system(size: 13))
                .frame(maxWidth: .infinity, alignment: .leading)
            if let onDismiss = onDismiss {
                Button(action: onDismiss) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(c.fg.opacity(0.8))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Dismiss")
            }
        }
        .padding(OrigonSpacing.md)
        .frame(minHeight: 52)
        .background(c.bg)
        .overlay(
            boxed ? RoundedRectangle(cornerRadius: OrigonRadius.sm).stroke(c.border, lineWidth: 1) : nil
        )
        .clipShape(boxed ? AnyShape(RoundedRectangle(cornerRadius: OrigonRadius.sm)) : AnyShape(Rectangle()))
    }
}

private struct AnyShape: Shape {
    private let _path: (CGRect) -> Path
    init<S: Shape>(_ shape: S) { _path = { shape.path(in: $0) } }
    func path(in rect: CGRect) -> Path { _path(rect) }
}
