import SwiftUI
import OrigonTokens

/// Origon UI OrigonRadio — single-choice input in an [OrigonRadioGroup].
/// Source: Figma `FK-Radio` (12:54256).

public enum OrigonRadioSize {
    case small, medium, large
    var outer: CGFloat { switch self { case .large: return 22; case .medium: return 18; case .small: return 14 } }
    var inner: CGFloat { switch self { case .large: return 10; case .medium: return 8; case .small: return 6 } }
}

public enum OrigonRadioOrientation { case vertical, horizontal }

public struct OrigonRadioOption<T: Hashable>: Identifiable {
    public let id = UUID()
    public let value: T
    public let label: String
    public let disabled: Bool
    public init(value: T, label: String, disabled: Bool = false) {
        self.value = value; self.label = label; self.disabled = disabled
    }
}

public struct OrigonRadioGroup<T: Hashable>: View {
    @Environment(\.origonTheme) private var theme
    @Binding var selection: T?
    let options: [OrigonRadioOption<T>]
    let size: OrigonRadioSize
    let orientation: OrigonRadioOrientation
    let isDisabled: Bool
    let semanticLabel: String?

    public init(
        selection: Binding<T?>,
        options: [OrigonRadioOption<T>],
        size: OrigonRadioSize = .medium,
        orientation: OrigonRadioOrientation = .vertical,
        isDisabled: Bool = false,
        semanticLabel: String? = nil
    ) {
        self._selection = selection
        self.options = options
        self.size = size
        self.orientation = orientation
        self.isDisabled = isDisabled
        self.semanticLabel = semanticLabel
    }

    public var body: some View {
        let content = ForEach(options) { opt in
            let selected = opt.value == selection
            let effectiveDisabled = isDisabled || opt.disabled
            Button {
                if !effectiveDisabled { selection = opt.value }
            } label: {
                HStack(spacing: OrigonSpacing.xs) {
                    ZStack {
                        Circle()
                            .fill(OrigonColors.blueGray.s50)
                            .frame(width: size.outer, height: size.outer)
                            .overlay(Circle().stroke(
                                effectiveDisabled ? OrigonColors.blueGray.s400
                                : selected ? theme.semantic.button.primary : OrigonColors.coolGray.s700,
                                lineWidth: 1
                            ))
                        if selected {
                            Circle()
                                .fill(effectiveDisabled ? OrigonColors.blueGray.s400 : theme.semantic.button.primary)
                                .frame(width: size.inner, height: size.inner)
                        }
                    }
                    Text(opt.label)
                        .foregroundColor(effectiveDisabled ? theme.semantic.text.disable : theme.semantic.text.focus)
                        .font(.system(size: 15))
                }
            }
            .buttonStyle(.plain)
            .disabled(effectiveDisabled)
        }

        return Group {
            if orientation == .vertical {
                VStack(alignment: .leading, spacing: OrigonSpacing.sm) { content }
            } else {
                HStack(spacing: OrigonSpacing.md) { content }
            }
        }
        .accessibilityLabel(semanticLabel ?? "")
    }
}
