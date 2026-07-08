import SwiftUI
import OrigonTokens

/// Origon UI OrigonKeyboard — numpad port.
/// Source: Figma `- Keyboards` (12:58173).

public enum OrigonKeyboardLayout { case numeric, decimal }

public struct OrigonKeyboard: View {
    @Environment(\.origonTheme) private var theme
    let layout: OrigonKeyboardLayout
    let onKey: (String) -> Void
    let onBackspace: (() -> Void)?
    let onConfirm: (() -> Void)?

    public init(
        layout: OrigonKeyboardLayout = .numeric,
        onKey: @escaping (String) -> Void,
        onBackspace: (() -> Void)? = nil,
        onConfirm: (() -> Void)? = nil
    ) {
        self.layout = layout
        self.onKey = onKey
        self.onBackspace = onBackspace
        self.onConfirm = onConfirm
    }

    public var body: some View {
        VStack(spacing: OrigonSpacing.xs) {
            row(["1", "2", "3"])
            row(["4", "5", "6"])
            row(["7", "8", "9"])
            row([layout == .decimal ? "." : "", "0", "⌫"])
            if onConfirm != nil {
                Button { onConfirm?() } label: {
                    Image(systemName: "checkmark")
                        .foregroundColor(OrigonColors.white)
                        .frame(maxWidth: .infinity, minHeight: 48)
                        .background(theme.semantic.button.primary)
                        .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
                }.buttonStyle(.plain)
            }
        }
        .padding(OrigonSpacing.sm)
        .background(OrigonColors.blueGray.s100)
        .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
    }

    @ViewBuilder
    private func row(_ keys: [String]) -> some View {
        HStack(spacing: OrigonSpacing.xs) {
            ForEach(keys, id: \.self) { k in
                if k.isEmpty {
                    Color.clear.frame(maxWidth: .infinity, minHeight: 48)
                } else if k == "⌫" {
                    Button { onBackspace?() } label: {
                        Image(systemName: "delete.left")
                            .foregroundColor(theme.semantic.text.focus)
                            .frame(maxWidth: .infinity, minHeight: 48)
                            .background(OrigonColors.blueGray.s200)
                            .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
                    }.buttonStyle(.plain)
                } else {
                    Button { onKey(k) } label: {
                        Text(k)
                            .foregroundColor(theme.semantic.text.focus)
                            .font(.system(size: 20, weight: .medium))
                            .frame(maxWidth: .infinity, minHeight: 48)
                            .background(OrigonColors.blueGray.s200)
                            .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
                    }.buttonStyle(.plain)
                }
            }
        }
    }
}
