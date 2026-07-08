import SwiftUI
import OrigonTokens

/// Origon UI OrigonTicker — infinite horizontal marquee.
/// Source: Figma `- Ticker` (12:3551).

public struct OrigonTickerItem: Identifiable {
    public let id: String
    public let content: AnyView
    public init<V: View>(id: String, @ViewBuilder content: () -> V) {
        self.id = id
        self.content = AnyView(content())
    }
}

public struct OrigonTicker: View {
    let items: [OrigonTickerItem]
    let duration: TimeInterval
    let gap: CGFloat
    let leftToRight: Bool

    @State private var offset: CGFloat = 0
    @State private var contentWidth: CGFloat = 0

    public init(items: [OrigonTickerItem], duration: TimeInterval = 40, gap: CGFloat = 40, leftToRight: Bool = false) {
        self.items = items
        self.duration = duration
        self.gap = gap
        self.leftToRight = leftToRight
    }

    public var body: some View {
        GeometryReader { _ in
            HStack(spacing: gap) {
                ForEach(items) { $0.content }
                // Duplicate for seamless loop.
                ForEach(items) { $0.content.id("\($0.id)-dup") }
            }
            .background(
                GeometryReader { proxy in
                    Color.clear
                        .onAppear { contentWidth = proxy.size.width / 2 }
                }
            )
            .offset(x: leftToRight ? offset - contentWidth : -offset)
            .onAppear { startAnimation() }
        }
        .frame(height: 32)
        .background(OrigonColors.blueGray.s100)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func startAnimation() {
        guard contentWidth > 0 else {
            // Wait one runloop for the initial measurement.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { startAnimation() }
            return
        }
        withAnimation(.linear(duration: duration).repeatForever(autoreverses: false)) {
            offset = contentWidth
        }
    }
}
