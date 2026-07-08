import SwiftUI
import OrigonTokens

/// Origon UI OrigonGraph — sparkline port.
/// Source: Figma `- Graph` (12:84746).

public struct OrigonGraph: View {
    let data: [Double]
    let width: CGFloat
    let height: CGFloat
    let color: Color?
    let showFill: Bool

    public init(
        data: [Double],
        width: CGFloat = 120,
        height: CGFloat = 40,
        color: Color? = nil,
        showFill: Bool = true
    ) {
        self.data = data
        self.width = width
        self.height = height
        self.color = color
        self.showFill = showFill
    }

    public var body: some View {
        guard data.count >= 2 else { return AnyView(EmptyView().frame(width: width, height: height)) }
        let trend = data.last! - data.first!
        let resolved = color ?? (trend >= 0 ? OrigonColors.green.s600 : OrigonColors.red.s600)
        return AnyView(
            Canvas { ctx, size in
                let lo = data.min()!
                let hi = data.max()!
                let range = hi == lo ? 1 : hi - lo
                func x(_ i: Int) -> CGFloat { CGFloat(i) / CGFloat(data.count - 1) * size.width }
                func y(_ v: Double) -> CGFloat { size.height - CGFloat((v - lo) / range) * size.height }

                var line = Path()
                line.move(to: CGPoint(x: x(0), y: y(data[0])))
                for i in 1..<data.count {
                    line.addLine(to: CGPoint(x: x(i), y: y(data[i])))
                }
                if showFill {
                    var area = line
                    area.addLine(to: CGPoint(x: x(data.count - 1), y: size.height))
                    area.addLine(to: CGPoint(x: x(0), y: size.height))
                    area.closeSubpath()
                    ctx.fill(area, with: .color(resolved.opacity(0.16)))
                }
                ctx.stroke(line, with: .color(resolved), style: StrokeStyle(lineWidth: 1.5, lineCap: .round, lineJoin: .round))
            }
            .frame(width: width, height: height)
        )
    }
}
