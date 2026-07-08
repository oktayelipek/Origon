import React, { type CSSProperties } from 'react';
import { colors, semantic, text, font } from '@origon/tokens-react';

export type GaugeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand';

export interface GaugeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Value between 0 and 100. */
  value: number;
  /** Overall diameter in pixels. */
  size?: number;
  tone?: GaugeTone;
  /** Show the numeric value inside. */
  showLabel?: boolean;
  /** Custom label override — defaults to `%<value>`. */
  label?: React.ReactNode;
}

const TONE_COLORS: Record<GaugeTone, string> = {
  neutral: colors.blueGray[500],
  success: colors.green[600],
  warning: colors.amber[500],
  danger:  colors.red[600],
  brand:   semantic.button?.primary ?? colors.blue[600],
};

/**
 * Gauge — circular progress ring with an optional percentage label at center.
 * Source: Figma `- Gauge` (`12:84862`). 6-color tone system with light track +
 * colored arc. Ring stroke is proportional to size (roughly size/12).
 */
export function Gauge({
  value,
  size = 44,
  tone = 'neutral',
  showLabel = true,
  label,
  style,
  ...rest
}: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = Math.max(2, Math.round(size / 12));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;
  const color = TONE_COLORS[tone];
  const trackColor = colors.blueGray[300];

  const wrapper: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    ...style,
  };

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      style={wrapper}
      {...rest}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dasharray 260ms ease' }}
        />
      </svg>
      {showLabel && (
        <span
          style={{
            position: 'absolute',
            color,
            fontFamily: font.family.primary,
            fontSize: Math.max(9, Math.round(size / 4)),
            lineHeight: 1,
            fontWeight: font.weight.medium,
          }}
        >
          {label ?? `%${Math.round(clamped)}`}
        </span>
      )}
    </div>
  );
}
