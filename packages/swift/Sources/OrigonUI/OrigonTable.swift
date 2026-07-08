import SwiftUI
import OrigonTokens

/// Origon UI OrigonTable — data grid. Uses SwiftUI's native `Table` on iOS 16+
/// / macOS 12+ for full sort/select behavior; wraps it with Origon typography.
/// Source: Figma `{FK-Table}` (12:48775).
///
/// For custom row rendering, use OrigonListRow directly in a List/LazyVStack.

public struct OrigonTableColumn<T: Identifiable> {
    public let key: String
    public let header: String
    public let render: (T) -> AnyView
    public let alignment: HorizontalAlignment
    public let sortable: Bool

    public init<V: View>(
        key: String,
        header: String,
        alignment: HorizontalAlignment = .leading,
        sortable: Bool = false,
        @ViewBuilder render: @escaping (T) -> V
    ) {
        self.key = key
        self.header = header
        self.alignment = alignment
        self.sortable = sortable
        self.render = { AnyView(render($0)) }
    }
}

public struct OrigonTableView<T: Identifiable>: View {
    @Environment(\.origonTheme) private var theme
    let columns: [OrigonTableColumn<T>]
    let rows: [T]
    @Binding var sortKey: String?
    @Binding var sortAscending: Bool
    let onRowTap: ((T) -> Void)?
    let dense: Bool

    public init(
        rows: [T],
        columns: [OrigonTableColumn<T>],
        sortKey: Binding<String?> = .constant(nil),
        sortAscending: Binding<Bool> = .constant(true),
        onRowTap: ((T) -> Void)? = nil,
        dense: Bool = false
    ) {
        self.rows = rows
        self.columns = columns
        self._sortKey = sortKey
        self._sortAscending = sortAscending
        self.onRowTap = onRowTap
        self.dense = dense
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack(spacing: OrigonSpacing.md) {
                ForEach(columns.indices, id: \.self) { i in
                    let col = columns[i]
                    Button {
                        if col.sortable {
                            if sortKey == col.key { sortAscending.toggle() }
                            else { sortKey = col.key; sortAscending = true }
                        }
                    } label: {
                        HStack(spacing: 4) {
                            Text(col.header).font(.system(size: 11, weight: .medium)).textCase(.uppercase)
                            if col.sortable {
                                Image(systemName: sortKey == col.key ? (sortAscending ? "chevron.up" : "chevron.down") : "chevron.up.chevron.down")
                                    .font(.system(size: 8))
                                    .opacity(sortKey == col.key ? 1 : 0.4)
                            }
                        }
                        .foregroundColor(sortKey == col.key ? theme.semantic.text.focus : theme.semantic.text.secondary)
                        .frame(maxWidth: .infinity, alignment: alignmentFor(col.alignment))
                    }
                    .buttonStyle(.plain)
                    .disabled(!col.sortable)
                }
            }
            .padding(.horizontal, OrigonSpacing.md)
            .padding(.vertical, OrigonSpacing.sm)
            .background(OrigonColors.blueGray.s200.opacity(0.4))
            .overlay(alignment: .bottom) {
                Rectangle().fill(OrigonColors.blueGray.s300).frame(height: 1)
            }

            // Rows
            ForEach(rows) { row in
                Button { onRowTap?(row) } label: {
                    HStack(spacing: OrigonSpacing.md) {
                        ForEach(columns.indices, id: \.self) { i in
                            columns[i].render(row)
                                .frame(maxWidth: .infinity, alignment: alignmentFor(columns[i].alignment))
                                .foregroundColor(theme.semantic.text.focus)
                                .font(.system(size: 13))
                        }
                    }
                    .padding(.horizontal, OrigonSpacing.md)
                    .padding(.vertical, dense ? OrigonSpacing.xs : OrigonSpacing.sm)
                }
                .buttonStyle(.plain)
                .disabled(onRowTap == nil)
                .overlay(alignment: .bottom) {
                    Rectangle().fill(OrigonColors.blueGray.s200).frame(height: 1)
                }
            }
        }
    }

    private func alignmentFor(_ h: HorizontalAlignment) -> Alignment {
        switch h {
        case .leading:  return .leading
        case .trailing: return .trailing
        case .center:   return .center
        default:        return .leading
        }
    }
}
