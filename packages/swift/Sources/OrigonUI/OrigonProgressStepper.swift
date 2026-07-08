import SwiftUI
import OrigonTokens

/// Origon UI OrigonProgressStepper — numbered dots + connecting lines.
/// Source: Figma `- Progress Stepper` (12:54443).

public enum OrigonStepperOrientation { case horizontal, vertical }

public struct OrigonStep: Identifiable {
    public let id = UUID()
    public let label: String?
    public let description: String?
    public init(label: String? = nil, description: String? = nil) {
        self.label = label; self.description = description
    }
}

public struct OrigonProgressStepper: View {
    @Environment(\.origonTheme) private var theme
    let steps: [OrigonStep]
    let active: Int
    let completed: Set<Int>
    let orientation: OrigonStepperOrientation

    public init(
        steps: [OrigonStep],
        active: Int,
        completed: [Int]? = nil,
        orientation: OrigonStepperOrientation = .horizontal
    ) {
        self.steps = steps
        self.active = active
        self.completed = Set(completed ?? Array(0..<active))
        self.orientation = orientation
    }

    public var body: some View {
        let isH = orientation == .horizontal
        let primary = theme.semantic.button.primary

        Group {
            if isH {
                HStack(spacing: 0) {
                    ForEach(Array(steps.enumerated()), id: \.element.id) { i, step in
                        stepView(i: i, step: step, primary: primary, isHorizontal: true)
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(Array(steps.enumerated()), id: \.element.id) { i, step in
                        stepView(i: i, step: step, primary: primary, isHorizontal: false)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func stepView(i: Int, step: OrigonStep, primary: Color, isHorizontal: Bool) -> some View {
        let isDone = completed.contains(i)
        let isActive = i == active
        let isLast = i == steps.count - 1
        let dotBg: Color = isDone || isActive ? primary : OrigonColors.blueGray.s300
        let dotFg: Color = isDone || isActive ? OrigonColors.white : theme.semantic.text.secondary
        let lineColor: Color = isDone ? primary : OrigonColors.blueGray.s300

        let dot = ZStack {
            Circle().fill(dotBg).frame(width: 24, height: 24)
            if isDone {
                Image(systemName: "checkmark").font(.system(size: 12, weight: .semibold)).foregroundColor(OrigonColors.white)
            } else {
                Text("\(i + 1)").foregroundColor(dotFg).font(.system(size: 11, weight: .medium))
            }
        }

        let line = Rectangle().fill(lineColor).frame(
            width: isHorizontal ? nil : 2,
            height: isHorizontal ? 2 : nil
        )

        let track = Group {
            if isHorizontal {
                HStack(spacing: 0) {
                    dot
                    if !isLast { line.padding(.horizontal, 4) }
                }
                .frame(maxWidth: .infinity)
            } else {
                VStack(spacing: 0) {
                    dot
                    if !isLast { line.padding(.vertical, 4).frame(minHeight: 24) }
                }
            }
        }

        let labelBlock = Group {
            if step.label != nil || step.description != nil {
                VStack(alignment: isHorizontal ? .center : .leading, spacing: 2) {
                    if let l = step.label {
                        Text(l)
                            .foregroundColor(isDone || isActive ? theme.semantic.text.focus : theme.semantic.text.secondary)
                            .font(.system(size: 13, weight: .medium))
                    }
                    if let d = step.description {
                        Text(d).foregroundColor(theme.semantic.text.secondary).font(.system(size: 11))
                    }
                }
                .padding(.top, isHorizontal ? OrigonSpacing.xxs : 0)
                .padding(.leading, isHorizontal ? 0 : OrigonSpacing.sm)
            }
        }

        if isHorizontal {
            VStack { track; labelBlock }.frame(maxWidth: .infinity)
        } else {
            HStack(alignment: .top) { track; labelBlock; Spacer() }
        }
    }
}
