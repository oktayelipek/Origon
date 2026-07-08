import SwiftUI
import OrigonTokens

/// Origon UI OrigonTabs — horizontal navigation.
/// Source: Figma `{Tab}` (12:48473).

public enum OrigonTabsVariant { case underline, pill }

public struct OrigonTab: Identifiable {
    public let id = UUID()
    public let value: String
    public let label: String
    public let icon: String?
    public let disabled: Bool
    public init(value: String, label: String, icon: String? = nil, disabled: Bool = false) {
        self.value = value; self.label = label; self.icon = icon; self.disabled = disabled
    }
}

public struct OrigonTabs: View {
    @Environment(\.origonTheme) private var theme
    @Binding var selection: String
    let tabs: [OrigonTab]
    let variant: OrigonTabsVariant
    let fullWidth: Bool

    public init(
        selection: Binding<String>,
        tabs: [OrigonTab],
        variant: OrigonTabsVariant = .underline,
        fullWidth: Bool = false
    ) {
        self._selection = selection
        self.tabs = tabs
        self.variant = variant
        self.fullWidth = fullWidth
    }

    public var body: some View {
        let isPill = variant == .pill

        return HStack(spacing: isPill ? OrigonSpacing.xxs : 0) {
            ForEach(tabs) { t in
                tabButton(t, selected: t.value == selection, isPill: isPill)
                    .frame(maxWidth: fullWidth ? .infinity : nil)
            }
        }
        .padding(isPill ? OrigonSpacing.xxs : 0)
        .background(isPill ? OrigonColors.blueGray.s200 : Color.clear)
        .clipShape(RoundedRectangle(cornerRadius: isPill ? 999 : 0))
        .overlay(alignment: .bottom) {
            if !isPill {
                Rectangle().fill(OrigonColors.blueGray.s300).frame(height: 1)
            }
        }
    }

    private func tabButton(_ t: OrigonTab, selected: Bool, isPill: Bool) -> some View {
        Button {
            if !t.disabled { selection = t.value }
        } label: {
            HStack(spacing: OrigonSpacing.xs) {
                if let iconName = t.icon {
                    Image(systemName: iconName).font(.system(size: 14))
                }
                Text(t.label)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(
                        t.disabled ? theme.semantic.text.disable
                        : selected ? theme.semantic.text.focus : theme.semantic.text.secondary
                    )
            }
            .padding(.horizontal, OrigonSpacing.md)
            .padding(.vertical, isPill ? OrigonSpacing.xs : OrigonSpacing.sm)
            .background(isPill && selected ? OrigonColors.blueGray.s400 : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: isPill ? 999 : 0))
            .overlay(alignment: .bottom) {
                if !isPill {
                    Rectangle()
                        .fill(selected ? theme.semantic.button.primary : Color.clear)
                        .frame(height: 2)
                        .offset(y: 1)
                }
            }
        }
        .buttonStyle(.plain)
        .disabled(t.disabled)
    }
}
