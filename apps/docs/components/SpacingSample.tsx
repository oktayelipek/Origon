import React from 'react';
import { spacing, radius } from '@origon/tokens-react';

/**
 * SpacingScale — vertical list of spacing tokens with a visual bar for each.
 */
export function SpacingScale() {
  const entries = Object.entries(spacing).sort(([, a], [, b]) => Number(a) - Number(b));
  const max = Math.max(...entries.map(([, v]) => Number(v)));
  return (
    <div>
      {entries.map(([name, value]) => (
        <div
          key={name}
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 60px 1fr',
            alignItems: 'center',
            gap: 16,
            padding: '8px 0',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <code style={{ fontSize: 13 }}>spacing.{name}</code>
          <code style={{ fontSize: 12, opacity: 0.7 }}>{value}px</code>
          <div
            style={{
              height: 16,
              width: `${(Number(value) / max) * 100}%`,
              background: '#256bbc',
              borderRadius: 2,
            }}
            aria-hidden
          />
        </div>
      ))}
    </div>
  );
}

/**
 * RadiusScale — sample tile for each radius token.
 */
export function RadiusScale() {
  const entries = Object.entries(radius).sort(([, a], [, b]) => Number(a) - Number(b));
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
      {entries.map(([name, value]) => (
        <div key={name} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 96,
              height: 96,
              background: '#256bbc',
              borderRadius: Number(value),
              marginBottom: 8,
            }}
            aria-hidden
          />
          <code style={{ fontSize: 12, display: 'block' }}>radius.{name}</code>
          <code style={{ fontSize: 11, opacity: 0.7 }}>{value}px</code>
        </div>
      ))}
    </div>
  );
}
