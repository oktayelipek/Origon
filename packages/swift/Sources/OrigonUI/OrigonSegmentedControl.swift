import SwiftUI
import OrigonTokens

/// Origon UI OrigonSegmentedControl — mutually-exclusive choice pill group.
/// Source: Figma `- Segmented Control` (12:49453).

public enum OrigonSegmentedSize { case small, medium
    var height: CGFloat { self == .small ? 30 : 38 }
    var fontSize: CGFloat { self == .small ? 11 : 13 }
}

public struct OrigonSegmentedOption<T: Hashable>: Identifiable {
    public let id = UUID()
    public let value: T
    public let label: String
    public let disabled: Bool
    public init(value: T, label: String, disabled: Bool = false) {
        self.value = value; self.label = label; self.disabled = disabled
    }
}

public struct OrigonSegmentedControl<T: Hashable>: View {
    @Environment(\.origonTheme) private var theme
    @Binding var selection: T
    let options: [OrigonSegmentedOption<T>]
    let size: OrigonSegmentedSize
    let fullWidth: Bool

    public init(
        selection: Binding<T>,
        options: [OrigonSegmentedOption<T>],
        size: OrigonSegmentedSize = .medium,
        fullWidth: Bool = false
    ) {
        self._selection = selection
        self.options = options
        self.size = size
        self.fullWidth = fullWidth
    }

    public var body: some View {
        HStack(spacing: 4) {
            ForEach(options) { opt in
                let selected = opt.value == selection
                Button {
                    if !opt.disabled { selection = opt.value }
                } label: {
                    Text(opt.label)
                        .font(.system(size: size.fontSize, weight: selected ? .medium : .regular))
                        .foregroundColor(
                            opt.disabled ? theme.semantic.text.disable
                            : selected ? theme.semantic.text.focus : theme.semantic.text.secondary
                        )
                        .padding(.horizontal, OrigonSpacing.md)
                        .frame(height: size.height)
                        .frame(maxWidth: fullWidth ? .infinity : nil)
                        .background(selected ? OrigonColors.blueGray.s400 : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.xxl))
                }
                .buttonStyle(.plain)
                .disabled(opt.disabled)
                .animation(.easeInOut(duration: 0.16), value: selected)
            }
        }
        .padding(4)
        .background(OrigonColors.blueGray.s200)
        .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.xxl))
    }
}
