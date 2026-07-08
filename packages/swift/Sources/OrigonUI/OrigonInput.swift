import SwiftUI
import OrigonTokens

/// Origon UI OrigonInput — port of the React `<Input>`.
/// Source: Figma `{FKInput}` (12:68514).

public enum OrigonInputSize { case large, small, xSmall

    var height: CGFloat {
        switch self { case .large: return 54; case .small: return 44; case .xSmall: return 32 }
    }
    var fontSize: CGFloat {
        switch self { case .large: return 15; case .small: return 13; case .xSmall: return 11 }
    }
}

public struct OrigonInput<Leading: View, Trailing: View>: View {
    @Environment(\.origonTheme) private var theme
    @Binding var text: String
    let placeholder: String
    let label: String?
    let hint: String?
    let errorText: String?
    let size: OrigonInputSize
    let isEnabled: Bool
    let leading: Leading?
    let trailing: Trailing?

    @FocusState private var isFocused: Bool

    public init(
        _ placeholder: String = "",
        text: Binding<String>,
        label: String? = nil,
        hint: String? = nil,
        errorText: String? = nil,
        size: OrigonInputSize = .large,
        isEnabled: Bool = true,
        @ViewBuilder leading: () -> Leading,
        @ViewBuilder trailing: () -> Trailing
    ) {
        self.placeholder = placeholder
        self._text = text
        self.label = label
        self.hint = hint
        self.errorText = errorText
        self.size = size
        self.isEnabled = isEnabled
        self.leading = leading()
        self.trailing = trailing()
    }

    public var body: some View {
        let hasError = !(errorText ?? "").isEmpty
        let bg: Color = isEnabled
            ? (isFocused && !hasError ? OrigonColors.blueGray.s400 : OrigonColors.blueGray.s200)
            : OrigonColors.blueGray.s200
        let borderColor: Color = hasError ? OrigonColors.red.s600 : .clear

        return VStack(alignment: .leading, spacing: OrigonSpacing.xxs) {
            if let label = label {
                Text(label)
                    .foregroundColor(isEnabled ? theme.semantic.text.secondary : theme.semantic.text.disable)
                    .font(.system(size: 11, weight: .medium))
            }
            HStack(spacing: OrigonSpacing.xs) {
                if let leading = leading { leading.frame(width: 20, height: 20) }
                TextField(placeholder, text: $text)
                    .focused($isFocused)
                    .disabled(!isEnabled)
                    .foregroundColor(isEnabled ? theme.semantic.text.focus : theme.semantic.text.disable)
                    .font(.system(size: size.fontSize))
                    .textFieldStyle(.plain)
                if let trailing = trailing { trailing.frame(width: 20, height: 20) }
            }
            .padding(.horizontal, OrigonSpacing.md)
            .frame(height: size.height)
            .background(bg)
            .overlay(RoundedRectangle(cornerRadius: OrigonRadius.sm).stroke(borderColor, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
            if hasError, let e = errorText {
                Text(e).foregroundColor(OrigonColors.red.s500).font(.system(size: 11))
            } else if let hint = hint {
                Text(hint).foregroundColor(theme.semantic.text.secondary).font(.system(size: 11))
            }
        }
    }
}

public extension OrigonInput where Leading == EmptyView, Trailing == EmptyView {
    init(
        _ placeholder: String = "",
        text: Binding<String>,
        label: String? = nil,
        hint: String? = nil,
        errorText: String? = nil,
        size: OrigonInputSize = .large,
        isEnabled: Bool = true
    ) {
        self.init(placeholder, text: text, label: label, hint: hint, errorText: errorText, size: size, isEnabled: isEnabled, leading: { EmptyView() }, trailing: { EmptyView() })
    }
}
