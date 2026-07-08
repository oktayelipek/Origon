import React from 'react';

export interface PropRow {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div style={{ margin: '16px 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            <th style={th}>Prop</th>
            <th style={th}>Type</th>
            <th style={th}>Default</th>
            <th style={th}>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td style={td}><code style={{ fontSize: 12, background: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: 3 }}>{r.name}</code></td>
              <td style={td}><code style={{ fontSize: 12 }}>{r.type}</code></td>
              <td style={td}><code style={{ fontSize: 12, opacity: 0.7 }}>{r.defaultValue ?? '—'}</code></td>
              <td style={td}>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid rgba(0,0,0,0.15)',
  fontWeight: 600,
  fontSize: 13,
};
const td: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid rgba(0,0,0,0.08)',
  verticalAlign: 'top',
};
