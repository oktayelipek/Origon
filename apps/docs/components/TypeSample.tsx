import React from 'react';
import { text, font } from '@origon/tokens-react';

type ScaleName = keyof typeof text;

/**
 * TypeSample — renders a live sample of one text scale in the chosen weight.
 * Usage:  <TypeSample scale="lg" weight="medium" />
 */
export function TypeSample({
  scale,
  weight = 'regular',
  sample = 'The quick brown fox jumps over the lazy dog',
}: {
  scale: ScaleName;
  weight?: keyof typeof font.weight;
  sample?: string;
}) {
  const style = text[scale];
  if (!style) return <div style={{ color: '#c00' }}>Unknown scale: {String(scale)}</div>;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr auto',
        alignItems: 'baseline',
        gap: 16,
        padding: '12px 0',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <code style={{ fontSize: 12, opacity: 0.7 }}>
        text.{scale} / {weight}
      </code>
      <div
        style={{
          fontFamily: font.family.primary,
          fontSize: style.fontSize,
          lineHeight: `${style.lineHeight}px`,
          fontWeight: font.weight[weight],
        }}
      >
        {sample}
      </div>
      <code style={{ fontSize: 11, opacity: 0.55, whiteSpace: 'nowrap' }}>
        {style.fontSize}/{style.lineHeight}
      </code>
    </div>
  );
}

/**
 * TypeScale — renders all sizes at one weight, top-down.
 */
export function TypeScale({ weight = 'regular' as keyof typeof font.weight }: { weight?: keyof typeof font.weight }) {
  const scales = Object.keys(text) as ScaleName[];
  return (
    <div>
      {scales.map((s) => (
        <TypeSample key={s} scale={s} weight={weight} />
      ))}
    </div>
  );
}
