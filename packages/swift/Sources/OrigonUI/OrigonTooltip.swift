import SwiftUI
import OrigonTokens

/// Origon UI OrigonTooltip — hover/long-press popover. Source: Figma
/// `{FK-Tooltip}` (11:2720).
///
/// Usage: attach as a view modifier.
///
///     Button("?") {}
///         .origonTooltip("Places a limit order at your price")

public extension View {
    func origonTooltip(_ message: String, side: Edge = .top) -> some View {
        modifier(OrigonTooltipModifier(message: message, side: side))
    }
}

struct OrigonTooltipModifier: ViewModifier {
    let message: String
    let side: Edge
    @State private var showing = false
    @Environment(\.origonTheme) private var theme

    func body(content: Content) -> some View {
        content
            .onHover { hovering in
                withAnimation(.easeOut(duration: 0.15)) { showing = hovering }
            }
            .overlay(alignment: alignment) {
                if showing {
                    tooltipCard
                        .fixedSize()
                        .transition(.opacity.combined(with: .scale(scale: 0.95)))
                }
            }
    }

    private var alignment: Alignment {
        switch side {
        case .top:    return .top
        case .bottom: return .bottom
        case .leading:  return .leading
        case .trailing: return .trailing
        }
    }

    private var tooltipCard: some View {
        Text(message)
            .foregroundColor(theme.semantic.text.focus)
            .font(.system(size: 11))
            .padding(.horizontal, OrigonSpacing.sm)
            .padding(.vertical, OrigonSpacing.xs)
            .background(OrigonColors.blueGray.s100)
            .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.xs))
            .shadow(color: .black.opacity(0.35), radius: 8, y: 4)
            .offset(offset)
            .allowsHitTesting(false)
    }

    private var offset: CGSize {
        switch side {
        case .top:    return CGSize(width: 0, height: -30)
        case .bottom: return CGSize(width: 0, height: 30)
        case .leading:  return CGSize(width: -12, height: 0)
        case .trailing: return CGSize(width: 12, height: 0)
        }
    }
}
