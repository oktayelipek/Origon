import SwiftUI
import OrigonTokens

/// Origon UI Toast — ephemeral notification managed by an [OrigonToastCenter]
/// observable. Attach a toast overlay at the app root with `.origonToastHost()`.
/// Source: Figma `{FK-Toast-Row}` (12:3039).

public enum OrigonToastTone { case info, success, warning, danger }

public struct OrigonToast: Identifiable, Equatable {
    public let id = UUID()
    public let title: String?
    public let message: String
    public let tone: OrigonToastTone
    public let duration: TimeInterval

    public init(message: String, title: String? = nil, tone: OrigonToastTone = .info, duration: TimeInterval = 4) {
        self.title = title; self.message = message; self.tone = tone; self.duration = duration
    }
}

@MainActor
public final class OrigonToastCenter: ObservableObject {
    public static let shared = OrigonToastCenter()
    @Published public private(set) var queue: [OrigonToast] = []

    public func post(_ toast: OrigonToast) {
        queue.append(toast)
        if toast.duration > 0 {
            let id = toast.id
            Task { @MainActor in
                try? await Task.sleep(nanoseconds: UInt64(toast.duration * 1_000_000_000))
                dismiss(id)
            }
        }
    }

    public func dismiss(_ id: UUID) {
        queue.removeAll { $0.id == id }
    }
}

public extension View {
    /// Attach at the app root:
    ///
    ///     WindowGroup { RootView().origonToastHost() }
    func origonToastHost(placement: OrigonToastPlacement = .bottomRight) -> some View {
        overlay(alignment: placement.alignment) {
            OrigonToastRegion(placement: placement)
        }
    }
}

public enum OrigonToastPlacement {
    case top, topRight, bottom, bottomRight
    var alignment: Alignment {
        switch self {
        case .top:         return .top
        case .topRight:    return .topTrailing
        case .bottom:      return .bottom
        case .bottomRight: return .bottomTrailing
        }
    }
}

struct OrigonToastRegion: View {
    let placement: OrigonToastPlacement
    @ObservedObject var center: OrigonToastCenter = .shared
    @Environment(\.origonTheme) private var theme

    var body: some View {
        VStack(spacing: OrigonSpacing.sm) {
            ForEach(center.queue) { t in
                toastCard(t)
                    .transition(.move(edge: placement == .top || placement == .topRight ? .top : .bottom).combined(with: .opacity))
            }
        }
        .padding(OrigonSpacing.md)
        .animation(.easeOut(duration: 0.22), value: center.queue)
    }

    private func toastCard(_ t: OrigonToast) -> some View {
        let accent = accentColor(t.tone)
        return HStack(alignment: .top, spacing: OrigonSpacing.sm) {
            VStack(alignment: .leading, spacing: 2) {
                if let title = t.title {
                    Text(title).foregroundColor(theme.semantic.text.focus).font(.system(size: 13, weight: .medium))
                }
                Text(t.message).foregroundColor(theme.semantic.text.focus.opacity(0.9)).font(.system(size: 13))
            }
            Spacer(minLength: 0)
            Button { OrigonToastCenter.shared.dismiss(t.id) } label: {
                Image(systemName: "xmark").font(.system(size: 12)).foregroundColor(theme.semantic.text.secondary)
            }.buttonStyle(.plain)
        }
        .padding(.horizontal, OrigonSpacing.md)
        .padding(.vertical, OrigonSpacing.sm)
        .frame(minWidth: 300, maxWidth: 420, alignment: .leading)
        .background(OrigonColors.blueGray.s200)
        .overlay(alignment: .leading) {
            Rectangle().fill(accent).frame(width: 3)
        }
        .clipShape(RoundedRectangle(cornerRadius: OrigonRadius.sm))
        .shadow(color: .black.opacity(0.4), radius: 24, y: 8)
    }

    private func accentColor(_ tone: OrigonToastTone) -> Color {
        switch tone {
        case .info:    return theme.semantic.button.primary
        case .success: return OrigonColors.green.s600
        case .warning: return OrigonColors.amber.s500
        case .danger:  return OrigonColors.red.s600
        }
    }
}
