import SwiftUI
import OrigonTokens

/// Origon UI OrigonChart — line/area/bar port. Lightweight in-house renderer.
/// Source: Figma `- Charts` (12:86299).

public enum OrigonChartKind { case line, area, bar }

public struct OrigonChartSeries: Identifiable {
    public let id = UUID()
    public let label: String?
    public let color: Color?
    public let data: [Double]

    public init(label: String? = nil, color: Color? = nil, data: [Double]) {
        self.label = label; self.color = color; self.data = data
    }
}

public struct OrigonChart: View {
    @Environment(\.origonTheme) private var theme
    let kind: OrigonChartKind
    let series: [OrigonChartSeries]
    let width: CGFloat
    let height: CGFloat
    let showGrid: Bool

    public init(
        kind: OrigonChartKind = .line,
        series: [OrigonChartSeries],
        width: CGFloat = 320,
        height: CGFloat = 160,
        showGrid: Bool = true
    ) {
        self.kind = kind
        self.series = series
        self.width = width
        self.height = height
        self.showGrid = showGrid
    }

    public var body: some View {
        Canvas { ctx, size in
            let padding = EdgeInsets(top: 12, leading: 8, bottom: 8, trailing: 12)
            let innerW = size.width - padding.leading - padding.trailing
            let innerH = size.height - padding.top - padding.bottom
            var lo = Double.infinity, hi = -Double.infinity
            var len = 0
            for s in series {
                len = max(len, s.data.count)
                for v in s.data { lo = min(lo, v); hi = max(hi, v) }
            }
            if lo == hi { lo -= 1; hi += 1 }
            func x(_ i: Int) -> CGFloat { padding.leading + CGFloat(i) / max(1, CGFloat(len - 1)) * innerW }
            func y(_ v: Double) -> CGFloat { padding.top + innerH - CGFloat((v - lo) / (hi - lo)) * innerH }

            let defaultColor = theme.semantic.button.primary
            let gridColor = OrigonColors.blueGray.s300.opacity(0.5)

            if showGrid {
                for f in [0.25, 0.5, 0.75] {
                    var p = Path()
                    p.move(to: CGPoint(x: padding.leading, y: padding.top + CGFloat(f) * innerH))
                    p.addLine(to: CGPoint(x: padding.leading + innerW, y: padding.top + CGFloat(f) * innerH))
                    ctx.stroke(p, with: .color(gridColor), lineWidth: 1)
                }
            }

            for (si, s) in series.enumerated() {
                let color = s.color ?? defaultColor
                if kind == .bar {
                    let barW = innerW / CGFloat(s.data.count * series.count) * 0.7
                    for (i, v) in s.data.enumerated() {
                        let rect = CGRect(
                            x: x(i) - barW * CGFloat(series.count) / 2 + CGFloat(si) * barW,
                            y: v >= 0 ? y(v) : y(0),
                            width: barW,
                            height: abs(y(v) - y(0))
                        )
                        ctx.fill(Path(roundedRect: rect, cornerRadius: 2), with: .color(color))
                    }
                    continue
                }
                var line = Path()
                line.move(to: CGPoint(x: x(0), y: y(s.data[0])))
                for i in 1..<s.data.count { line.addLine(to: CGPoint(x: x(i), y: y(s.data[i]))) }
                if kind == .area {
                    var area = line
                    area.addLine(to: CGPoint(x: x(s.data.count - 1), y: padding.top + innerH))
                    area.addLine(to: CGPoint(x: x(0), y: padding.top + innerH))
                    area.closeSubpath()
                    ctx.fill(area, with: .color(color.opacity(0.18)))
                }
                ctx.stroke(line, with: .color(color), style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
            }
        }
        .frame(width: width, height: height)
    }
}
