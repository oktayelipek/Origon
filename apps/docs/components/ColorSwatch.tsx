import React from 'react';
import { colors } from '@origon/tokens-react';

type ScaleName = keyof typeof colors;

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function pickScale(name: string): Record<string, string> | null {
  const parts = name.split('.');
  let node: unknown = colors;
  for (const part of parts) {
    if (!isRecord(node) || !(part in node)) return null;
    node = (node as Record<string, unknown>)[part];
  }
  if (!isRecord(node)) return null;
  const keys = Object.keys(node);
  if (!keys.every((k) => /^\d+$/.test(k))) return null;
  return node as Record<string, string>;
}

/**
 * ColorScale — renders a horizontal strip of swatches for a 50→900 palette.
 * Usage in MDX:  <ColorScale name="blueGray" />  or  <ColorScale name="brand.kripto" />
 */
export function ColorScale({ name, label }: { name: string; label?: string }) {
  const scale = pickScale(name);
  if (!scale) return <div style={{ color: '#c00' }}>Unknown scale: {name}</div>;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
        {label ?? name}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 4 }}>
        {STEPS.map((step) => {
          const hex = scale[String(step)];
          if (!hex) return null;
          const dark = isDark(hex);
          return (
            <div
              key={step}
              style={{
                background: hex,
                color: dark ? '#fff' : '#111',
                padding: '12px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: 64,
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontWeight: 600 }}>{step}</span>
              <span style={{ opacity: 0.75 }}>{hex}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ColorTile — single flat color (e.g., base.white, base.black).
 */
export function ColorTile({ name, hex, label }: { name?: string; hex?: string; label?: string }) {
  const resolved =
    hex ??
    (name
      ? (() => {
          const parts = name.split('.');
          let node: unknown = colors;
          for (const p of parts) {
            if (!isRecord(node)) return undefined;
            node = (node as Record<string, unknown>)[p];
          }
          return typeof node === 'string' ? node : undefined;
        })()
      : undefined);
  if (!resolved) return <div style={{ color: '#c00' }}>Unknown color: {name}</div>;
  const dark = isDark(resolved);
  return (
    <div
      style={{
        background: resolved,
        color: dark ? '#fff' : '#111',
        padding: 16,
        borderRadius: 6,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 140,
      }}
    >
      <span style={{ fontWeight: 600 }}>{label ?? name}</span>
      <span style={{ opacity: 0.75 }}>{resolved}</span>
    </div>
  );
}

function isDark(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma < 0.55;
}
