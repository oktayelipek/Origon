import SwiftUI
import OrigonTokens

/// Origon UI OrigonListRow — data row composition.
/// Named `OrigonListRow` to avoid collision with SwiftUI's `Row` conventions.
/// Source: Figma `- Row` (12:51134) + `- Price Row` (12:54723).

public enum OrigonRowMetaTone { case `default`, success, danger }

public struct OrigonListRow<Leading: View, Trailing: View>: View {
    @Environment(\.origonTheme) private var theme
    let leading: Leading?
    let title: String
    let subtitle: String?
    let meta: String?
    let metaSubtitle: String?
    let metaTone: OrigonRowMetaTone
    let trailing: Trailing?
    let onTap: (() -> Void)?
    let dense: Bool

    public init(
        title: String,
        subtitle: String? = nil,
        meta: String? = nil,
        metaSubtitle: String? = nil,
        metaTone: OrigonRowMetaTone = .default,
        onTap: (() -> Void)? = nil,
        dense: Bool = false,
        @ViewBuilder leading: () -> Leading,
        @ViewBuilder trailing: () -> Trailing
    ) {
        self.title = title
        self.subtitle = subtitle
        self.meta = meta
        self.metaSubtitle = metaSubtitle
        self.metaTone = metaTone
        self.onTap = onTap
        self.dense = dense
        self.leading = leading()
        self.trailing = trailing()
    }

    private var metaColor: Color {
        switch metaTone {
        case .success: return OrigonColors.green.s600
        case .danger:  return OrigonColors.red.s500
        case .default: return theme.semantic.text.secondary
        }
    }

    public var body: some View {
        let content = HStack(spacing: OrigonSpacing.sm) {
            if let leading = leading {
                leading
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title).foregroundColor(theme.semantic.text.focus).font(.system(size: 15, weight: .medium)).lineLimit(1)
                if let s = subtitle {
                    Text(s).foregroundColor(theme.semantic.text.secondary).font(.system(size: 13)).lineLimit(1)
                }
            }
            Spacer(minLength: 0)
            if meta != nil || metaSubtitle != nil {
                VStack(alignment: .trailing, spacing: 2) {
                    if let m = meta {
                        Text(m).foregroundColor(theme.semantic.text.focus).font(.system(size: 15, weight: .medium))
                    }
                    if let ms = metaSubtitle {
                        Text(ms).foregroundColor(metaColor).font(.system(size: 13, weight: .medium))
                    }
                }
            }
            if let trailing = trailing {
                trailing.foregroundColor(theme.semantic.text.secondary)
            }
        }
        .padding(.horizontal, OrigonSpacing.md)
        .padding(.vertical, dense ? OrigonSpacing.xs : OrigonSpacing.sm)

        if let onTap = onTap {
            return AnyView(
                Button(action: onTap) { content }
                    .buttonStyle(.plain)
            )
        }
        return AnyView(content)
    }
}

public extension OrigonListRow where Leading == EmptyView, Trailing == EmptyView {
    init(
        title: String,
        subtitle: String? = nil,
        meta: String? = nil,
        metaSubtitle: String? = nil,
        metaTone: OrigonRowMetaTone = .default,
        onTap: (() -> Void)? = nil,
        dense: Bool = false
    ) {
        self.init(
            title: title, subtitle: subtitle, meta: meta, metaSubtitle: metaSubtitle,
            metaTone: metaTone, onTap: onTap, dense: dense,
            leading: { EmptyView() }, trailing: { EmptyView() }
        )
    }
}
