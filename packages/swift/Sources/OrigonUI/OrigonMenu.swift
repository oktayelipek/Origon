import SwiftUI
import OrigonTokens

/// Origon UI OrigonMenu — anchored action list using SwiftUI's Menu.
/// Source: Figma `- Menu` (12:55798).

public struct OrigonMenuItem: Identifiable {
    public let id = UUID()
    public let value: String
    public let label: String
    public let icon: String?
    public let disabled: Bool
    public let danger: Bool
    public let divider: Bool

    public init(value: String, label: String, icon: String? = nil, disabled: Bool = false, danger: Bool = false, divider: Bool = false) {
        self.value = value; self.label = label; self.icon = icon
        self.disabled = disabled; self.danger = danger; self.divider = divider
    }
}

public struct OrigonMenuView<Trigger: View>: View {
    let trigger: Trigger
    let items: [OrigonMenuItem]
    let onSelect: (String) -> Void

    public init(items: [OrigonMenuItem], onSelect: @escaping (String) -> Void, @ViewBuilder trigger: () -> Trigger) {
        self.items = items
        self.onSelect = onSelect
        self.trigger = trigger()
    }

    public var body: some View {
        Menu {
            ForEach(Array(items.enumerated()), id: \.element.id) { i, item in
                if item.divider && i > 0 { Divider() }
                Button(role: item.danger ? .destructive : nil) {
                    onSelect(item.value)
                } label: {
                    HStack {
                        if let icon = item.icon {
                            Image(systemName: icon)
                        }
                        Text(item.label)
                    }
                }
                .disabled(item.disabled)
            }
        } label: {
            trigger
        }
    }
}
