import SwiftUI
import OrigonTokens

/// Origon UI OrigonPinInput — segmented digit boxes (2FA / PIN entry).
/// Source: Figma FKInput Feature=Numeric / Encrypted (12:68514).

public struct OrigonPinInput: View {
    @Environment(\.origonTheme) private var theme
    @Binding var value: String
    let length: Int
    let onComplete: ((String) -> Void)?
    let isEnabled: Bool
    let autoFocus: Bool
    let mask: Bool
    let errorText: String?
    let label: String?

    @FocusState private var focusedIndex: Int?

    public init(
        value: Binding<String>,
        length: Int = 6,
        isEnabled: Bool = true,
        autoFocus: Bool = false,
        mask: Bool = false,
        errorText: String? = nil,
        label: String? = nil,
        onComplete: ((String) -> Void)? = nil
    ) {
        precondition(length == 4 || length == 6, "length must be 4 or 6")
        self._value = value
        self.length = length
        self.isEnabled = isEnabled
        self.autoFocus = autoFocus
        self.mask = mask
        self.errorText = errorText
        self.label = label
        self.onComplete = onComplete
    }

    private func char(at i: Int) -> String {
        i < value.count ? String(value[value.index(value.startIndex, offsetBy: i)]) : ""
    }

    private func setChar(_ i: Int, _ ch: String) {
        var chars = Array(repeating: "", count: length)
        for k in 0..<min(length, value.count) {
            chars[k] = String(value[value.index(value.startIndex, offsetBy: k)])
        }
        chars[i] = ch
        let next = chars.joined()
        value = next
        if next.count == length && !chars.contains("") {
            onComplete?(next)
        }
    }

    public var body: some View {
        let hasError = !(errorText ?? "").isEmpty

        return VStack(alignment: .leading, spacing: OrigonSpacing.xxs) {
            if let label = label {
                Text(label)
                    .foregroundColor(theme.semantic.text.secondary)
                    .font(.system(size: 11, weight: .medium))
            }
            HStack(spacing: OrigonSpacing.xs) {
                ForEach(0..<length, id: \.self) { i in
                    PinBox(
                        text: Binding(
                            get: { char(at: i) },
                            set: { newValue in
                                let digits = newValue.filter { $0.isNumber }
                                if digits.count > 1 {
                                    // Paste — split across boxes.
                                    var chars = Array(repeating: "", count: length)
                                    for k in 0..<min(length, value.count) {
                                        chars[k] = String(value[value.index(value.startIndex, offsetBy: k)])
                                    }
                                    var k = i
                                    for d in digits {
                                        if k >= length { break }
                                        chars[k] = String(d)
                                        k += 1
                                    }
                                    let next = chars.joined()
                                    value = next
                                    focusedIndex = min(k, length - 1)
                                    if next.count == length && !chars.contains("") { onComplete?(next) }
                                    return
                                }
                                if let last = digits.last {
                                    setChar(i, String(last))
                                    if i < length - 1 { focusedIndex = i + 1 }
                                } else {
                                    setChar(i, "")
                                }
                            }
                        ),
                        mask: mask,
                        filled: !char(at: i).isEmpty,
                        hasError: hasError,
                        isEnabled: isEnabled
                    )
                    .focused($focusedIndex, equals: i)
                    .onKeyPress(.leftArrow) { if i > 0 { focusedIndex = i - 1; return .handled }; return .ignored }
                    .onKeyPress(.rightArrow) { if i < length - 1 { focusedIndex = i + 1; return .handled }; return .ignored }
                    .onKeyPress(.delete) {
                        if char(at: i).isEmpty && i > 0 {
                            setChar(i - 1, "")
                            focusedIndex = i - 1
                            return .handled
                        }
                        return .ignored
                    }
                }
            }
            if hasError, let e = errorText {
                Text(e).foregroundColor(OrigonColors.red.s500).font(.system(size: 11))
            }
        }
        .onAppear {
            if autoFocus { focusedIndex = 0 }
        }
    }
}

private struct PinBox: View {
    @Binding var text: String
    let mask: Bool
    let filled: Bool
    let hasError: Bool
    let isEnabled: Bool

    var body: some View {
        Group {
            if mask {
                SecureField("", text: $text)
            } else {
                TextField("", text: $text)
            }
        }
        .disabled(!isEnabled)
        .multilineTextAlignment(.center)
        .font(.system(size: 20, weight: .medium))
        .foregroundColor(OrigonSemantic.Text.focus)
        .keyboardType(.numberPad)
        .textContentType(.oneTimeCode)
        .frame(width: 46, height: 54)
        .background(filled ? OrigonColors.blueGray.s400 : OrigonColors.blueGray.s200)
        .overlay(
            RoundedRectangle(cornerRadius: OrigonRadius.sm)
                .stroke(hasError ? OrigonColors.red.s600 : (filled ? OrigonColors.blueGray.s500 : .clear), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
    }
}
