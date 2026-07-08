import SwiftUI
import OrigonTokens

/// Origon UI OrigonRangeSlider — single/dual thumb slider.
/// Source: Figma `- Range Selector` (12:54109).

public struct OrigonRangeSlider: View {
    @Environment(\.origonTheme) private var theme
    @Binding var single: Double?
    @Binding var lower: Double?
    @Binding var upper: Double?
    let range: ClosedRange<Double>
    let step: Double
    let isDual: Bool
    let isEnabled: Bool
    let label: String?
    let formatValue: (Double) -> String

    public init(
        value: Binding<Double>,
        in range: ClosedRange<Double> = 0...100,
        step: Double = 1,
        isEnabled: Bool = true,
        label: String? = nil,
        formatValue: @escaping (Double) -> String = { "\(Int($0))" }
    ) {
        self._single = Binding<Double?>(get: { value.wrappedValue }, set: { if let v = $0 { value.wrappedValue = v } })
        self._lower = .constant(nil)
        self._upper = .constant(nil)
        self.range = range
        self.step = step
        self.isDual = false
        self.isEnabled = isEnabled
        self.label = label
        self.formatValue = formatValue
    }

    public init(
        lower: Binding<Double>,
        upper: Binding<Double>,
        in range: ClosedRange<Double> = 0...100,
        step: Double = 1,
        isEnabled: Bool = true,
        label: String? = nil,
        formatValue: @escaping (Double) -> String = { "\(Int($0))" }
    ) {
        self._single = .constant(nil)
        self._lower = Binding<Double?>(get: { lower.wrappedValue }, set: { if let v = $0 { lower.wrappedValue = v } })
        self._upper = Binding<Double?>(get: { upper.wrappedValue }, set: { if let v = $0 { upper.wrappedValue = v } })
        self.range = range
        self.step = step
        self.isDual = true
        self.isEnabled = isEnabled
        self.label = label
        self.formatValue = formatValue
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: OrigonSpacing.xs) {
            if let label = label {
                Text(label).foregroundColor(theme.semantic.text.secondary).font(.system(size: 11, weight: .medium))
            }
            if isDual {
                // Dual thumb — simplified using two Sliders overlaid (SwiftUI has
                // no native range slider). For richer UX plug in a custom gesture.
                DualSlider(lower: $lower, upper: $upper, range: range, step: step, isEnabled: isEnabled, primary: theme.semantic.button.primary)
            } else {
                Slider(value: Binding(get: { single ?? range.lowerBound }, set: { single = $0 }), in: range, step: step)
                    .disabled(!isEnabled)
                    .tint(theme.semantic.button.primary)
            }
        }
    }
}

private struct DualSlider: View {
    @Binding var lower: Double?
    @Binding var upper: Double?
    let range: ClosedRange<Double>
    let step: Double
    let isEnabled: Bool
    let primary: Color

    var body: some View {
        VStack(spacing: 4) {
            Slider(value: Binding(get: { lower ?? range.lowerBound }, set: { newVal in
                lower = min(newVal, (upper ?? range.upperBound) - step)
            }), in: range, step: step).disabled(!isEnabled).tint(primary)
            Slider(value: Binding(get: { upper ?? range.upperBound }, set: { newVal in
                upper = max(newVal, (lower ?? range.lowerBound) + step)
            }), in: range, step: step).disabled(!isEnabled).tint(primary)
        }
    }
}
