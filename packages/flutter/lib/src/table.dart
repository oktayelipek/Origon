import 'package:flutter/material.dart';
import 'package:origon_tokens/origon_tokens.dart';

/// Origon UI OrigonTable — data grid with sortable headers.
/// Source: Figma `{FK-Table}` (12:48775). For very large datasets integrate
/// a lazy list; this primitive wraps Flutter's DataTable with Origon styling.

class OrigonTableColumn<T> {
  final String key;
  final Widget header;
  final Widget Function(T row) render;
  final bool sortable;
  final TextAlign align;
  const OrigonTableColumn({
    required this.key,
    required this.header,
    required this.render,
    this.sortable = false,
    this.align = TextAlign.left,
  });
}

class OrigonTableSort {
  final String key;
  final bool ascending;
  const OrigonTableSort({required this.key, required this.ascending});
}

class OrigonTable<T> extends StatelessWidget {
  final List<OrigonTableColumn<T>> columns;
  final List<T> rows;
  final OrigonTableSort? sort;
  final ValueChanged<String>? onSort;
  final ValueChanged<T>? onRowTap;
  final bool dense;

  const OrigonTable({
    super.key,
    required this.columns,
    required this.rows,
    this.sort,
    this.onSort,
    this.onRowTap,
    this.dense = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = OrigonTheme.of(context);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columnSpacing: OrigonSpacing.md,
        horizontalMargin: OrigonSpacing.md,
        headingRowHeight: 40,
        dataRowMinHeight: dense ? 40 : 48,
        dataRowMaxHeight: dense ? 48 : 56,
        headingTextStyle: TextStyle(
          color: theme.semantic.text.secondary,
          fontFamily: OrigonFont.primary,
          fontSize: 11,
          fontWeight: OrigonFont.medium,
        ),
        dataTextStyle: TextStyle(
          color: theme.semantic.text.focus,
          fontFamily: OrigonFont.primary,
          fontSize: 13,
        ),
        dividerThickness: 1,
        border: TableBorder(
          bottom: BorderSide(color: OrigonColors.blueGray.s200),
          horizontalInside: BorderSide(color: OrigonColors.blueGray.s200),
        ),
        sortColumnIndex: sort != null
            ? columns.indexWhere((c) => c.key == sort!.key)
            : null,
        sortAscending: sort?.ascending ?? true,
        columns: columns.map((c) => DataColumn(
          label: DefaultTextStyle.merge(child: c.header, style: const TextStyle()),
          onSort: c.sortable ? (_, __) => onSort?.call(c.key) : null,
        )).toList(),
        rows: rows.map((row) => DataRow(
          onSelectChanged: onRowTap != null ? (_) => onRowTap!(row) : null,
          cells: columns.map((c) => DataCell(c.render(row))).toList(),
        )).toList(),
      ),
    );
  }
}
