import SwiftUI
import OrigonTokens

/// Origon UI OrigonChip — port of the React `<Chip>`.
/// Source: Figma `Chip` (12:86248) and `Chip [Selector]` (12:86235).

public enum OrigonChipSize { case xs, sm, md, lg }
public enum OrigonChipVariant { case line, solid }

struct OrigonChipSpec {
    let paddingX: CGFloat
    let paddingY: CGFloat
    let height: CGFloat
    let fontSize: CGFloat
    let gap: CGFloat
    let iconSize: CGFloat
}

extension OrigonChipSize {
    var spec: OrigonChipSpec {
        switch self {
        case .lg: return .init(paddingX: 40, paddingY: 16, height: 46, fontSize: 15, gap: 8,  iconSize: 20)
        case .md: return .init(paddingX: 32, paddingY: 12, height: 38, fontSize: 13, gap: 8,  iconSize: 18)
        case .sm: return .init(paddingX: 24, paddingY: 8,  height: 30, fontSize: 11, gap: 4,  iconSize: 14)
        case .xs: return .init(paddingX: 8,  paddingY: 4,  height: 20, fontSize: 11, gap: 4,  iconSize: 12)
        }
    }
}

public struct OrigonChip<Label: View>: View {
    @Environment(\.origonTheme) private var theme
    let label: Label
    let size: OrigonChipSize
    let variant: OrigonChipVariant
    let isInteractive: Bool
    @Binding var isSelected: Bool
    let onTap: (() -> Void)?

    /// Display chip (non-interactive).
    public init(
        size: OrigonChipSize = .md,
        variant: OrigonChipVariant = .line,
        @ViewBuilder label: () -> Label
    ) {
        self.label = label()
        self.size = size
        self.variant = variant
        self.isInteractive = false
        self._isSelected = .constant(false)
        self.onTap = nil
    }

    /// Selector chip (interactive).
    public init(
        selected: Binding<Bool>,
        size: OrigonChipSize = .xs,
        @ViewBuilder label: () -> Label
    ) {
        self.label = label()
        self.size = size
        self.variant = .solid
        self.isInteractive = true
        self._isSelected = selected
        self.onTap = nil
    }

    public var body: some View {
        let spec = size.spec
        let bg: Color = isInteractive
            ? (isSelected ? theme.semantic.button.primary : Color.clear)
            : (variant == .solid ? OrigonColors.blueGray.s200 : Color.clear)
        let fg: Color = isInteractive
            ? (isSelected ? OrigonColors.white : theme.semantic.text.focus)
            : theme.semantic.text.focus
        let border: Color? = isInteractive
            ? (isSelected ? nil : OrigonColors.blueGray.s300)
            : OrigonColors.blueGray.s200

        let content = HStack(spacing: spec.gap) {
            label
                .foregroundColor(fg)
                .font(.system(size: spec.fontSize, weight: .medium))
        }
        .padding(.horizontal, spec.paddingX)
        .padding(.vertical, spec.paddingY)
        .frame(minHeight: spec.height)
        .background(bg)
        .overlay(
            RoundedRectangle(cornerRadius: OrigonRadius.xxl)
                .stroke(border ?? .clear, lineWidth: border != nil ? 1 : 0)
        )
        .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.xxl))

        if isInteractive {
            return AnyView(
                Button {
                    isSelected.toggle()
                } label: {
                    content
                }
                .buttonStyle(.plain)
            )
        }
        return AnyView(content)
    }
}
