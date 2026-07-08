import SwiftUI
import OrigonTokens

/// Origon UI OrigonButton — 1:1 port of the React `<Button>` component.
/// Source: Figma component set `{FKButton}` (node 8:135).
///
/// Keep this in sync with packages/react/src/Button/Button.tsx and
/// packages/flutter/lib/src/button.dart. Design values (padding, radius, text
/// size) are extracted from Figma and identical across platforms.

public enum OrigonButtonSize {
    case small, medium, large
}

public enum OrigonButtonVariant {
    case primary, focus, outline, ghost
}

public enum OrigonButtonPresence {
    case `default`, subtle
}

public enum OrigonButtonIconPosition {
    case leading, trailing, only
}

struct OrigonButtonSizeSpec {
    let paddingX: CGFloat
    let paddingY: CGFloat
    let radius: CGFloat
    let height: CGFloat
    let fontSize: CGFloat
    let lineHeight: CGFloat
    let iconSize: CGFloat
    let gap: CGFloat
}

extension OrigonButtonSize {
    var spec: OrigonButtonSizeSpec {
        switch self {
        case .large:  return .init(paddingX: 48, paddingY: 12, radius: 12, height: 44, fontSize: 15, lineHeight: 20, iconSize: 20, gap: 8)
        case .medium: return .init(paddingX: 40, paddingY: 8,  radius: 8,  height: 34, fontSize: 13, lineHeight: 18, iconSize: 16, gap: 8)
        case .small:  return .init(paddingX: 12, paddingY: 4,  radius: 28, height: 22, fontSize: 11, lineHeight: 14, iconSize: 14, gap: 4)
        }
    }
}

public struct OrigonButton<Label: View, IconContent: View>: View {
    let label: Label?
    let icon: IconContent?
    let size: OrigonButtonSize
    let variant: OrigonButtonVariant
    let presence: OrigonButtonPresence
    let iconPosition: OrigonButtonIconPosition
    let direction: OrigonButtonDirection
    let fullWidth: Bool
    let isDisabled: Bool
    let action: () -> Void

    @Environment(\.origonTheme) private var theme
    @State private var isHovered = false
    @State private var isPressed = false

    public init(
        size: OrigonButtonSize = .large,
        variant: OrigonButtonVariant = .primary,
        presence: OrigonButtonPresence = .default,
        iconPosition: OrigonButtonIconPosition = .leading,
        direction: OrigonButtonDirection = .horizontal,
        fullWidth: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void,
        @ViewBuilder label: () -> Label,
        @ViewBuilder icon: () -> IconContent
    ) {
        self.label = label()
        self.icon = icon()
        self.size = size
        self.variant = variant
        self.presence = presence
        self.iconPosition = iconPosition
        self.direction = direction
        self.fullWidth = fullWidth
        self.isDisabled = isDisabled
        self.action = action
    }

    private var colors: (bg: Color, fg: Color, border: Color?) {
        if isDisabled {
            let isOutlineOrGhost = variant == .outline || variant == .ghost
            return (
                bg: isOutlineOrGhost ? Color.clear : theme.semantic.button.disable,
                fg: theme.semantic.text.disable,
                border: variant == .outline ? theme.semantic.border.level2 : nil
            )
        }

        var baseBg: Color
        var baseFg: Color
        var baseBorder: Color?
        switch variant {
        case .primary:
            baseBg = theme.semantic.button.primary
            baseFg = OrigonColors.white
            baseBorder = nil
        case .focus:
            baseBg = theme.semantic.button.focus
            baseFg = OrigonColors.blueGray.s50
            baseBorder = nil
        case .outline:
            baseBg = Color.clear
            baseFg = theme.semantic.text.focus
            baseBorder = theme.semantic.border.level5
        case .ghost:
            baseBg = Color.clear
            baseFg = theme.semantic.text.focus
            baseBorder = nil
        }

        if presence == .subtle && (variant == .primary || variant == .focus) {
            return (bg: baseBg.opacity(0.16), fg: baseBg, border: nil)
        }
        if isPressed {
            return (bg: baseBg.opacity(0.85), fg: baseFg, border: baseBorder)
        }
        if isHovered {
            return (bg: baseBg.opacity(0.92), fg: baseFg, border: baseBorder)
        }
        return (bg: baseBg, fg: baseFg, border: baseBorder)
    }

    public var body: some View {
        let spec = size.spec
        let c = colors
        let iconOnly = iconPosition == .only
        let isVertical = direction == .vertical && !iconOnly && icon != nil

        let inner: AnyView = {
            if isVertical {
                return AnyView(
                    VStack(spacing: spec.gap / 2) {
                        if let icon = icon {
                            icon.frame(width: spec.iconSize, height: spec.iconSize)
                        }
                        if let label = label {
                            label.foregroundColor(c.fg).font(.system(size: spec.fontSize, weight: .medium))
                        }
                    }
                )
            }
            return AnyView(
                HStack(spacing: spec.gap) {
                    if let icon = icon, (iconPosition == .leading || iconPosition == .only) {
                        icon.frame(width: spec.iconSize, height: spec.iconSize)
                    }
                    if let label = label, iconPosition != .only {
                        label
                            .foregroundColor(c.fg)
                            .font(.system(size: spec.fontSize, weight: .medium))
                    }
                    if let icon = icon, iconPosition == .trailing {
                        icon.frame(width: spec.iconSize, height: spec.iconSize)
                    }
                }
            )
        }()

        return inner
        .padding(.horizontal, iconOnly ? spec.paddingY : (isVertical ? spec.paddingY * 2 : spec.paddingX))
        .padding(.vertical, spec.paddingY)
        .frame(maxWidth: fullWidth ? .infinity : nil, minHeight: isVertical ? nil : spec.height)
        .background(c.bg)
        .overlay(
            RoundedRectangle(cornerRadius: spec.radius)
                .stroke(c.border ?? Color.clear, lineWidth: c.border != nil ? 1 : 0)
        )
        .clipShape(RoundedRectangle(cornerRadius: spec.radius))
        .onHover { isHovered = $0 }
        .onTapGesture { if !isDisabled { action() } }
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in if !isDisabled { isPressed = true } }
                .onEnded { _ in isPressed = false }
        )
        .disabled(isDisabled)
    }
}

/// Text-only convenience initializer.
public extension OrigonButton where Label == Text, IconContent == EmptyView {
    init(
        _ title: String,
        size: OrigonButtonSize = .large,
        variant: OrigonButtonVariant = .primary,
        presence: OrigonButtonPresence = .default,
        fullWidth: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.init(
            size: size,
            variant: variant,
            presence: presence,
            iconPosition: .leading,
            fullWidth: fullWidth,
            isDisabled: isDisabled,
            action: action,
            label: { Text(title) },
            icon: { EmptyView() }
        )
    }
}

#if DEBUG
#Preview {
    VStack(spacing: 12) {
        OrigonButton("Primary", action: {})
        OrigonButton("Focus", variant: .focus, action: {})
        OrigonButton("Outline", variant: .outline, action: {})
        OrigonButton("Ghost", variant: .ghost, action: {})
        OrigonButton("Disabled", isDisabled: true, action: {})
        OrigonButton("Small", size: .small, action: {})
        OrigonButton("Medium", size: .medium, action: {})
    }
    .padding()
    .background(OrigonThemes.kriptoDark.semantic.level.basement)
}
#endif
