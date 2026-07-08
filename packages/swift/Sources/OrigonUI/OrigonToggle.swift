import SwiftUI
import OrigonTokens

/// Origon UI OrigonToggle — iOS-style boolean switch.
/// Source: Figma `{FK-Toggle}` (12:3011).

public enum OrigonToggleSize {
    case small, medium, large
    var track: CGSize {
        switch self {
        case .large:  return CGSize(width: 44, height: 26)
        case .medium: return CGSize(width: 36, height: 22)
        case .small:  return CGSize(width: 28, height: 16)
        }
    }
    var thumb: CGFloat { switch self { case .large: return 22; case .medium: return 18; case .small: return 12 } }
    var pad: CGFloat { 2 }
}

public enum OrigonToggleLabelPosition { case left, right }

public struct OrigonToggle: View {
    @Environment(\.origonTheme) private var theme
    @Binding var isOn: Bool
    let label: String?
    let labelPosition: OrigonToggleLabelPosition
    let size: OrigonToggleSize
    let isDisabled: Bool

    public init(
        isOn: Binding<Bool>,
        label: String? = nil,
        labelPosition: OrigonToggleLabelPosition = .right,
        size: OrigonToggleSize = .medium,
        isDisabled: Bool = false
    ) {
        self._isOn = isOn
        self.label = label
        self.labelPosition = labelPosition
        self.size = size
        self.isDisabled = isDisabled
    }

    public var body: some View {
        let trackColor: Color = isDisabled
            ? OrigonColors.blueGray.s300
            : isOn ? theme.semantic.button.primary : OrigonColors.blueGray.s400

        let track = ZStack(alignment: isOn ? .trailing : .leading) {
            RoundedRectangle(cornerRadius: size.track.height / 2)
                .fill(trackColor)
                .frame(width: size.track.width, height: size.track.height)
                .animation(.easeInOut(duration: 0.16), value: isOn)
            Circle()
                .fill(OrigonColors.white)
                .frame(width: size.thumb, height: size.thumb)
                .padding(size.pad)
                .shadow(color: .black.opacity(0.35), radius: 3, y: 1)
                .animation(.spring(response: 0.24, dampingFraction: 0.75), value: isOn)
        }
        .onTapGesture {
            if !isDisabled { isOn.toggle() }
        }
        .accessibilityAddTraits(.isButton)
        .accessibilityValue(isOn ? "on" : "off")

        return Group {
            if let label = label {
                HStack(spacing: OrigonSpacing.sm) {
                    if labelPosition == .left {
                        Text(label).foregroundColor(isDisabled ? theme.semantic.text.disable : theme.semantic.text.focus).font(.system(size: 15))
                        track
                    } else {
                        track
                        Text(label).foregroundColor(isDisabled ? theme.semantic.text.disable : theme.semantic.text.focus).font(.system(size: 15))
                    }
                }
            } else {
                track
            }
        }
        .disabled(isDisabled)
    }
}
