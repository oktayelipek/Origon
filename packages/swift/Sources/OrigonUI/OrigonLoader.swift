import SwiftUI
import OrigonTokens

/// Origon UI OrigonLoader — 1:1 port of the React `<Loader>` component.
/// Source: Figma component set `FK-Loader` (node 12:58010).
/// Wave animation across 12 petals with staggered opacity.

public enum OrigonLoaderSize {
    case xxSmall, small, medium, large

    var dimensions: CGSize {
        switch self {
        case .large:   return CGSize(width: 44, height: 60)
        case .medium:  return CGSize(width: 32, height: 44)
        case .small:   return CGSize(width: 24, height: 33)
        case .xxSmall: return CGSize(width: 8, height: 11)
        }
    }
}

public struct OrigonLoader: View {
    @Environment(\.origonTheme) private var theme
    let size: OrigonLoaderSize
    let label: String

    @State private var phase: Double = 0

    public init(size: OrigonLoaderSize = .medium, label: String = "Loading") {
        self.size = size
        self.label = label
    }

    public var body: some View {
        let dim = size.dimensions
        return ZStack {
            ForEach(0..<12) { i in
                let localPhase = ((Double(i) / 12.0) + phase).truncatingRemainder(dividingBy: 1.0)
                let opacity = 0.35 + 0.65 * pulse(localPhase)
                let angle = (Double(i) / 12.0) * 2 * .pi
                Ellipse()
                    .fill(theme.semantic.text.tertiary.opacity(opacity))
                    .frame(width: dim.width * 0.16, height: dim.height * 0.09)
                    .offset(
                        x: cos(angle) * dim.width * 0.35,
                        y: sin(angle) * dim.height * 0.4
                    )
            }
        }
        .frame(width: dim.width, height: dim.height)
        .accessibilityLabel(label)
        .onAppear {
            withAnimation(.linear(duration: 1.05).repeatForever(autoreverses: false)) {
                phase = 1
            }
        }
    }

    private func pulse(_ p: Double) -> Double {
        if p < 0.3 { return p / 0.3 }
        return 1.0 - ((p - 0.3) / 0.7)
    }
}

#if DEBUG
#Preview {
    HStack(spacing: 24) {
        OrigonLoader(size: .xxSmall)
        OrigonLoader(size: .small)
        OrigonLoader(size: .medium)
        OrigonLoader(size: .large)
    }
    .padding()
    .background(OrigonThemes.kriptoDark.semantic.level.basement)
}
#endif
