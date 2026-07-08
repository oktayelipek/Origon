import SwiftUI
import OrigonTokens

/// Origon UI OrigonFilter — filter pill port.
/// Source: Figma `Header Filter` / `Header Filter [Icons]` (12:84954).

public struct OrigonFilter: View {
    @Environment(\.origonTheme) private var theme
    let label: String
    let value: String?
    let onTap: (() -> Void)?
    let onDismiss: (() -> Void)?
    let isEnabled: Bool

    public init(
        label: String,
        value: String? = nil,
        isEnabled: Bool = true,
        onTap: (() -> Void)? = nil,
        onDismiss: (() -> Void)? = nil
    ) {
        self.label = label
        self.value = value
        self.onTap = onTap
        self.onDismiss = onDismiss
        self.isEnabled = isEnabled
    }

    public var body: some View {
        let bg: Color = isEnabled ? OrigonColors.blueGray.s200 : OrigonColors.blueGray.s100
        let fg: Color = isEnabled ? theme.semantic.text.focus : theme.semantic.text.disable

        return Button(action: { onTap?() }) {
            HStack(spacing: OrigonSpacing.xs) {
                Text("\(label):").foregroundColor(theme.semantic.text.secondary).font(.system(size: 11, weight: .medium))
                if let v = value {
                    Text(v).foregroundColor(fg).font(.system(size: 11, weight: .medium))
                }
                if onDismiss != nil {
                    Button(action: { onDismiss?() }) {
                        Image(systemName: "xmark.circle.fill").font(.system(size: 12)).foregroundColor(theme.semantic.text.secondary)
                    }.buttonStyle(.plain)
                } else {
                    Image(systemName: "chevron.down").font(.system(size: 10)).foregroundColor(theme.semantic.text.secondary)
                }
            }
            .padding(.horizontal, OrigonSpacing.sm)
            .frame(height: 30)
            .background(bg)
            .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.xxl))
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
    }
}

public struct OrigonSortFilter: View {
    public enum Direction { case asc, desc, none }

    @Environment(\.origonTheme) private var theme
    let label: String
    let direction: Direction
    let onTap: () -> Void

    public init(label: String, direction: Direction = .none, onTap: @escaping () -> Void) {
        self.label = label
        self.direction = direction
        self.onTap = onTap
    }

    public var body: some View {
        Button(action: onTap) {
            HStack(spacing: OrigonSpacing.xxs) {
                Image(systemName: direction == .asc ? "arrow.up" : direction == .desc ? "arrow.down" : "arrow.up.arrow.down")
                    .font(.system(size: 10))
                    .foregroundColor(theme.semantic.text.focus)
                Text(label).foregroundColor(theme.semantic.text.focus).font(.system(size: 11, weight: .medium))
                Image(systemName: "chevron.down").font(.system(size: 10)).foregroundColor(theme.semantic.text.secondary)
            }
            .padding(.horizontal, OrigonSpacing.sm)
            .frame(height: 30)
            .background(OrigonColors.blueGray.s200)
            .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.xxl))
        }
        .buttonStyle(.plain)
    }
}
