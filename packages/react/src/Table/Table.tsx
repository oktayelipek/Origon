import React, { type ReactNode, type CSSProperties } from 'react';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /** When true, the header shows a sort chevron; parent controls sort state via onSort. */
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  sortBy?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string) => void;
  emptyState?: ReactNode;
  dense?: boolean;
  'aria-label'?: string;
}

/**
 * Table — data grid with sortable header, hover rows, alignment control.
 * Source: Figma `{FK-Table}` (12:48775).
 */
export function Table<T>({
  columns, rows, getRowKey, onRowClick, sortBy, onSort, emptyState, dense = false, 'aria-label': ariaLabel,
}: TableProps<T>) {
  const cellPad = dense ? `${spacing.xs}px ${spacing.md}px` : `${spacing.sm}px ${spacing.md}px`;
  const primary = semantic.button?.primary ?? colors.blue[600];

  return (
    <div style={{ width: '100%', overflowX: 'auto', fontFamily: font.family.primary }}>
      <table role="table" aria-label={ariaLabel} style={{ width: '100%', borderCollapse: 'collapse', fontSize: text.sm.fontSize }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.blueGray[300]}` }}>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{
                  textAlign: col.align ?? 'left',
                  padding: cellPad,
                  color: semantic.text.secondary,
                  fontWeight: font.weight.medium,
                  fontSize: text.xs.fontSize,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  width: col.width,
                  cursor: col.sortable ? 'pointer' : undefined,
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => col.sortable && onSort?.(col.key)}
                aria-sort={sortBy?.key === col.key ? (sortBy.direction === 'asc' ? 'ascending' : 'descending') : col.sortable ? 'none' : undefined}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: sortBy?.key === col.key ? semantic.text.focus : undefined }}>
                  {col.header}
                  {col.sortable && (
                    <svg viewBox="0 0 12 12" width={10} height={10} fill="none" aria-hidden style={{ opacity: sortBy?.key === col.key ? 1 : 0.4 }}>
                      <path
                        d={sortBy?.key === col.key && sortBy.direction === 'asc' ? 'M6 10V2M3 5l3-3 3 3' : sortBy?.key === col.key && sortBy.direction === 'desc' ? 'M6 2v8M3 7l3 3 3-3' : 'M4 4l2-2 2 2M4 8l2 2 2-2'}
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: `${spacing.xl}px ${spacing.md}px`, textAlign: 'center', color: semantic.text.secondary }}>
                {emptyState ?? 'No data'}
              </td>
            </tr>
          ) : rows.map((row, i) => (
            <tr
              key={getRowKey(row, i)}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: `1px solid ${colors.blueGray[200]}`,
                cursor: onRowClick ? 'pointer' : undefined,
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = colors.blueGray[200]; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: cellPad, textAlign: col.align ?? 'left', color: semantic.text.focus, verticalAlign: 'middle' }}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
