import SwiftUI
import OrigonTokens

/// Origon UI OrigonPhoneInput — country picker + national number.
/// Source: Figma FKInput Feature=Phone (12:68514).

public struct OrigonPhoneCountry: Identifiable, Hashable {
    public let id = UUID()
    public let code: String
    public let dial: String
    public let flag: String
    public let name: String
    public init(code: String, dial: String, flag: String, name: String) {
        self.code = code; self.dial = dial; self.flag = flag; self.name = name
    }
}

public let OrigonPhoneCountries: [OrigonPhoneCountry] = [
    .init(code: "TR", dial: "+90",  flag: "🇹🇷", name: "Türkiye"),
    .init(code: "DE", dial: "+49",  flag: "🇩🇪", name: "Deutschland"),
    .init(code: "FR", dial: "+33",  flag: "🇫🇷", name: "France"),
    .init(code: "GB", dial: "+44",  flag: "🇬🇧", name: "United Kingdom"),
    .init(code: "US", dial: "+1",   flag: "🇺🇸", name: "United States"),
    .init(code: "JP", dial: "+81",  flag: "🇯🇵", name: "Japan"),
    .init(code: "RU", dial: "+7",   flag: "🇷🇺", name: "Russia"),
    .init(code: "AE", dial: "+971", flag: "🇦🇪", name: "UAE"),
]

public struct OrigonPhoneInput: View {
    @Environment(\.origonTheme) private var theme
    @Binding var text: String
    @Binding var countryCode: String
    let label: String?
    let hint: String?
    let errorText: String?
    let placeholder: String
    let isEnabled: Bool

    @FocusState private var focused: Bool
    @State private var showingPicker = false

    public init(
        text: Binding<String>,
        countryCode: Binding<String>,
        label: String? = nil,
        hint: String? = nil,
        errorText: String? = nil,
        placeholder: String = "5xx xxx xx xx",
        isEnabled: Bool = true
    ) {
        self._text = text
        self._countryCode = countryCode
        self.label = label
        self.hint = hint
        self.errorText = errorText
        self.placeholder = placeholder
        self.isEnabled = isEnabled
    }

    private var country: OrigonPhoneCountry {
        OrigonPhoneCountries.first(where: { $0.code == countryCode }) ?? OrigonPhoneCountries[0]
    }

    public var body: some View {
        let hasError = !(errorText ?? "").isEmpty
        let bg: Color = isEnabled
            ? (focused && !hasError ? OrigonColors.blueGray.s400 : OrigonColors.blueGray.s200)
            : OrigonColors.blueGray.s200
        let borderColor: Color = hasError ? OrigonColors.red.s600 : .clear

        return VStack(alignment: .leading, spacing: OrigonSpacing.xxs) {
            if let label = label {
                Text(label)
                    .foregroundColor(isEnabled ? OrigonSemantic.Text.secondary : OrigonSemantic.Text.disable)
                    .font(.system(size: 11, weight: .medium))
            }
            HStack(spacing: OrigonSpacing.xs) {
                Button {
                    showingPicker = true
                } label: {
                    HStack(spacing: OrigonSpacing.xs) {
                        Text(country.flag).font(.system(size: 20))
                        Text(country.dial)
                            .foregroundColor(theme.semantic.text.focus)
                            .font(.system(size: 15))
                        Image(systemName: "chevron.down").font(.system(size: 10)).foregroundColor(theme.semantic.text.secondary)
                    }
                    .padding(.horizontal, OrigonSpacing.md)
                    .frame(height: 54)
                    .background(bg)
                    .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
                }
                .buttonStyle(.plain)
                .disabled(!isEnabled)
                .sheet(isPresented: $showingPicker) {
                    List(OrigonPhoneCountries) { c in
                        Button {
                            countryCode = c.code
                            showingPicker = false
                        } label: {
                            HStack {
                                Text(c.flag).font(.system(size: 20))
                                Text(c.name)
                                Spacer()
                                Text(c.dial).foregroundColor(.secondary)
                            }
                        }
                    }
                    .presentationDetents([.medium])
                }

                TextField(placeholder, text: $text)
                    .focused($focused)
                    .keyboardType(.phonePad)
                    .disabled(!isEnabled)
                    .foregroundColor(theme.semantic.text.focus)
                    .font(.system(size: 15))
                    .textFieldStyle(.plain)
                    .padding(.horizontal, OrigonSpacing.md)
                    .frame(height: 54)
                    .background(bg)
                    .overlay(RoundedRectangle(cornerRadius: OrigonRadius.sm).stroke(borderColor, lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
                    .onChange(of: text) { newValue in
                        let sanitized = newValue.filter { $0.isNumber || $0 == " " }
                        if sanitized != newValue { text = sanitized }
                    }
            }
            if hasError, let e = errorText {
                Text(e).foregroundColor(OrigonColors.red.s500).font(.system(size: 11))
            } else if let hint = hint {
                Text(hint).foregroundColor(theme.semantic.text.secondary).font(.system(size: 11))
            }
        }
    }
}
