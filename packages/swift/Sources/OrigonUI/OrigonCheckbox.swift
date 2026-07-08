import SwiftUI
import OrigonTokens

/// Origon UI OrigonCheckbox — port of the React `<Checkbox>`.
/// Source: Figma `Checkbox` (12:86274).

public enum OrigonCheckboxSize {
    case small, medium, large

    var box: CGFloat {
        switch self { case .large: return 24; case .medium: return 20; case .small: return 16 }
    }
    var radius: CGFloat {
        self == .small ? OrigonRadius.xxs : OrigonRadius.xs
    }
}

public struct OrigonCheckbox<Label: View>: View {
    @Environment(\.origonTheme) private var theme
    @Binding var isOn: Bool
    let size: OrigonCheckboxSize
    let isDisabled: Bool
    let hasError: Bool
    let label: Label?

    public init(
        isOn: Binding<Bool>,
        size: OrigonCheckboxSize = .medium,
        isDisabled: Bool = false,
        hasError: Bool = false,
        @ViewBuilder label: () -> Label
    ) {
        self._isOn = isOn
        self.size = size
        self.isDisabled = isDisabled
        self.hasError = hasError
        self.label = label()
    }

    public var body: some View {
        let bg = isOn && !isDisabled ? theme.semantic.button.primary : OrigonColors.blueGray.s50
        let borderColor: Color = hasError
            ? OrigonColors.red.s600
            : (isOn && !isDisabled ? .clear : OrigonColors.coolGray.s700)

        return Button {
            if !isDisabled { isOn.toggle() }
        } label: {
            HStack(spacing: OrigonSpacing.xs) {
                ZStack {
                    RoundedRectangle(cornerRadius: size.radius)
                        .fill(bg)
                        .overlay(
                            RoundedRectangle(cornerRadius: size.radius).stroke(borderColor, lineWidth: 1)
                        )
                        .frame(width: size.box, height: size.box)
                    if isOn && !isDisabled {
                        Image(systemName: "checkmark")
                            .font(.system(size: size.box * 0.55, weight: .semibold))
                            .foregroundColor(OrigonColors.white)
                    }
                    if isDisabled {
                        Path { p in
                            p.move(to: CGPoint(x: 2, y: size.box - 2))
                            p.addLine(to: CGPoint(x: size.box - 2, y: 2))
                        }
                        .stroke(OrigonColors.coolGray.s700, lineWidth: 1)
                    }
                }
                label
                    .foregroundColor(isDisabled ? theme.semantic.text.disable : theme.semantic.text.focus)
                    .font(.system(size: 15))
            }
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
    }
}
