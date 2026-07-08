import SwiftUI
import OrigonTokens

/// Origon UI OrigonDropdown — port of the React `<Dropdown>`.
/// Uses SwiftUI's native `Menu` for the popover; combobox variant needs a
/// custom picker screen and defers to v2.
/// Source: Figma `- Dropdown/Combo` (12:85331).

public struct OrigonDropdownOption<T: Hashable>: Identifiable {
    public let id = UUID()
    public let value: T
    public let label: String
    public let disabled: Bool
    public init(value: T, label: String, disabled: Bool = false) {
        self.value = value; self.label = label; self.disabled = disabled
    }
}

public struct OrigonDropdown<T: Hashable>: View {
    @Environment(\.origonTheme) private var theme
    let options: [OrigonDropdownOption<T>]
    @Binding var selection: T?
    let placeholder: String
    let isEnabled: Bool

    public init(
        options: [OrigonDropdownOption<T>],
        selection: Binding<T?>,
        placeholder: String = "Select…",
        isEnabled: Bool = true
    ) {
        self.options = options
        self._selection = selection
        self.placeholder = placeholder
        self.isEnabled = isEnabled
    }

    public var body: some View {
        let selected = options.first(where: { $0.value == selection })
        let bg: Color = isEnabled ? OrigonColors.blueGray.s200 : OrigonColors.blueGray.s100

        return Menu {
            ForEach(options) { opt in
                Button(opt.label) { selection = opt.value }
                    .disabled(opt.disabled)
            }
        } label: {
            HStack {
                Text(selected?.label ?? placeholder)
                    .foregroundColor(isEnabled
                        ? (selected != nil ? theme.semantic.text.focus : theme.semantic.text.secondary)
                        : theme.semantic.text.disable)
                    .font(.system(size: 15))
                    .lineLimit(1)
                Spacer()
                Image(systemName: "chevron.down").font(.system(size: 12)).foregroundColor(theme.semantic.text.secondary)
            }
            .padding(.horizontal, OrigonSpacing.md)
            .frame(height: 44)
            .background(bg)
            .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
        }
        .disabled(!isEnabled)
    }
}
