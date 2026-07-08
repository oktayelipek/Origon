import SwiftUI
import OrigonTokens

/// Origon UI OrigonMultiLineInput — textarea variant.
/// Source: Figma FKInput Feature=Multi Line (12:68514).

public struct OrigonMultiLineInput: View {
    @Environment(\.origonTheme) private var theme
    @Binding var text: String
    let label: String?
    let hint: String?
    let errorText: String?
    let placeholder: String
    let rows: Int
    let maxRows: Int
    let autoResize: Bool
    let isEnabled: Bool
    let showCounter: Bool
    let maxLength: Int?

    @FocusState private var focused: Bool

    public init(
        text: Binding<String>,
        label: String? = nil,
        hint: String? = nil,
        errorText: String? = nil,
        placeholder: String = "",
        rows: Int = 3,
        maxRows: Int = 8,
        autoResize: Bool = false,
        isEnabled: Bool = true,
        showCounter: Bool = false,
        maxLength: Int? = nil
    ) {
        self._text = text
        self.label = label
        self.hint = hint
        self.errorText = errorText
        self.placeholder = placeholder
        self.rows = rows
        self.maxRows = maxRows
        self.autoResize = autoResize
        self.isEnabled = isEnabled
        self.showCounter = showCounter
        self.maxLength = maxLength
    }

    public var body: some View {
        let hasError = !(errorText ?? "").isEmpty
        let length = text.count
        let overLimit = maxLength.map { length >= $0 } ?? false

        let bg: Color = isEnabled
            ? (focused && !hasError ? OrigonColors.blueGray.s400 : OrigonColors.blueGray.s200)
            : OrigonColors.blueGray.s200
        let borderColor: Color = hasError ? OrigonColors.red.s600 : .clear

        return VStack(alignment: .leading, spacing: OrigonSpacing.xxs) {
            if let label = label {
                Text(label)
                    .foregroundColor(isEnabled ? theme.semantic.text.secondary : theme.semantic.text.disable)
                    .font(.system(size: 11, weight: .medium))
            }

            TextEditor(text: $text)
                .focused($focused)
                .disabled(!isEnabled)
                .foregroundColor(isEnabled ? theme.semantic.text.focus : theme.semantic.text.disable)
                .font(.system(size: 15))
                .scrollContentBackground(.hidden)
                .background(bg)
                .overlay(RoundedRectangle(cornerRadius: OrigonRadius.sm).stroke(borderColor, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
                .frame(
                    minHeight: CGFloat(rows) * 20 + OrigonSpacing.md * 2,
                    maxHeight: autoResize ? CGFloat(maxRows) * 20 + OrigonSpacing.md * 2 : CGFloat(rows) * 20 + OrigonSpacing.md * 2
                )
                .onChange(of: text) { newValue in
                    if let m = maxLength, newValue.count > m {
                        text = String(newValue.prefix(m))
                    }
                }

            HStack {
                if hasError, let e = errorText {
                    Text(e).foregroundColor(OrigonColors.red.s500).font(.system(size: 11))
                } else if let hint = hint {
                    Text(hint).foregroundColor(theme.semantic.text.secondary).font(.system(size: 11))
                }
                Spacer()
                if showCounter, let m = maxLength {
                    Text("\(length) / \(m)")
                        .foregroundColor(overLimit ? OrigonColors.red.s500 : theme.semantic.text.secondary)
                        .font(.system(size: 11))
                }
            }
        }
    }
}
