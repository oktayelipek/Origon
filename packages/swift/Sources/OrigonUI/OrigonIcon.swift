import SwiftUI

/// Origon UI OrigonIcon — starter icon set. Uses SF Symbols on Apple platforms.
/// Source: Figma `- Icons + Logos` (12:73747). Full library export is a v2 task.

public enum OrigonIconName: String {
    case check, close, chevronDown, chevronRight
    case info, alert, star, search, plus, minus, arrowUp, arrowDown

    var sfSymbol: String {
        switch self {
        case .check:         return "checkmark"
        case .close:         return "xmark"
        case .chevronDown:   return "chevron.down"
        case .chevronRight:  return "chevron.right"
        case .info:          return "info.circle"
        case .alert:         return "exclamationmark.triangle"
        case .star:          return "star"
        case .search:        return "magnifyingglass"
        case .plus:          return "plus"
        case .minus:         return "minus"
        case .arrowUp:       return "arrow.up"
        case .arrowDown:     return "arrow.down"
        }
    }
}

public struct OrigonIcon: View {
    let name: OrigonIconName
    let size: CGFloat

    public init(_ name: OrigonIconName, size: CGFloat = 20) {
        self.name = name
        self.size = size
    }

    public var body: some View {
        Image(systemName: name.sfSymbol)
            .font(.system(size: size, weight: .regular))
    }
}
