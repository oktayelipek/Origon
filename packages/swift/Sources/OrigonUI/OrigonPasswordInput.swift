import SwiftUI
import OrigonTokens

/// Origon UI OrigonPasswordInput — masked field with visibility toggle and
/// optional strength meter. Source: Figma FKInput + Password Helper (12:68514).

public enum OrigonPasswordStrength {
    case weak, middle, strong

    static func score(_ v: String) -> OrigonPasswordStrength {
        var s = 0
        if v.count >= 8 { s += 1 }
        if v.count >= 12 { s += 1 }
        if v.contains(where: { $0.isUppercase }) && v.contains(where: { $0.isLowercase }) { s += 1 }
        if v.contains(where: { $0.isNumber }) { s += 1 }
        if v.contains(where: { !$0.isLetter && !$0.isNumber }) { s += 1 }
        return s <= 2 ? .weak : s <= 3 ? .middle : .strong
    }

    var color: Color {
        switch self {
        case .weak:   return OrigonColors.red.s500
        case .middle: return OrigonColors.amber.s500
        case .strong: return OrigonColors.green.s600
        }
    }
    var label: String { switch self { case .weak: return "Weak"; case .middle: return "Medium"; case .strong: return "Strong" } }
    var filled: Int { switch self { case .weak: return 1; case .middle: return 2; case .strong: return 3 } }
}

public struct OrigonPasswordInput: View {
    @Environment(\.origonTheme) private var theme
    @Binding var text: String
    let label: String?
    let hint: String?
    let errorText: String?
    let placeholder: String
    let isEnabled: Bool
    let showStrengthMeter: Bool
    let scoreStrength: (String) -> OrigonPasswordStrength

    @State private var visible = false
    @FocusState private var focused: Bool

    public init(
        text: Binding<String>,
        label: String? = nil,
        hint: String? = nil,
        errorText: String? = nil,
        placeholder: String = "",
        isEnabled: Bool = true,
        showStrengthMeter: Bool = false,
        scoreStrength: @escaping (String) -> OrigonPasswordStrength = OrigonPasswordStrength.score
    ) {
        self._text = text
        self.label = label
        self.hint = hint
        self.errorText = errorText
        self.placeholder = placeholder
        self.isEnabled = isEnabled
        self.showStrengthMeter = showStrengthMeter
        self.scoreStrength = scoreStrength
    }

    public var body: some View {
        let hasError = !(errorText ?? "").isEmpty
        let bg: Color = isEnabled
            ? (focused && !hasError ? OrigonColors.blueGray.s400 : OrigonColors.blueGray.s200)
            : OrigonColors.blueGray.s200
        let borderColor: Color = hasError ? OrigonColors.red.s600 : .clear
        let strength = text.isEmpty ? nil : scoreStrength(text)

        return VStack(alignment: .leading, spacing: OrigonSpacing.xxs) {
            if let label = label {
                Text(label)
                    .foregroundColor(isEnabled ? theme.semantic.text.secondary : theme.semantic.text.disable)
                    .font(.system(size: 11, weight: .medium))
            }
            HStack(spacing: OrigonSpacing.xs) {
                Group {
                    if visible {
                        TextField(placeholder, text: $text).textContentType(.password)
                    } else {
                        SecureField(placeholder, text: $text)
                    }
                }
                .focused($focused)
                .disabled(!isEnabled)
                .foregroundColor(theme.semantic.text.focus)
                .font(.system(size: 15))
                .textFieldStyle(.plain)

                Button { visible.toggle() } label: {
                    Image(systemName: visible ? "eye.slash" : "eye")
                        .foregroundColor(theme.semantic.text.secondary)
                        .font(.system(size: 18))
                }
                .buttonStyle(.plain)
                .accessibilityLabel(visible ? "Hide password" : "Show password")
            }
            .padding(.horizontal, OrigonSpacing.md)
            .frame(height: 54)
            .background(bg)
            .overlay(RoundedRectangle(cornerRadius: OrigonRadius.sm).stroke(borderColor, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))

            if showStrengthMeter, let s = strength {
                HStack(spacing: 4) {
                    ForEach(0..<3, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 2)
                            .fill(i < s.filled ? s.color : OrigonColors.blueGray.s300)
                            .frame(width: 24, height: 4)
                    }
                    Text(s.label)
                        .foregroundColor(s.color)
                        .font(.system(size: 11, weight: .medium))
                        .padding(.leading, OrigonSpacing.xs)
                }
            }
            if hasError, let e = errorText {
                Text(e).foregroundColor(OrigonColors.red.s500).font(.system(size: 11))
            } else if let hint = hint, !(showStrengthMeter && !text.isEmpty) {
                Text(hint).foregroundColor(theme.semantic.text.secondary).font(.system(size: 11))
            }
        }
    }
}
