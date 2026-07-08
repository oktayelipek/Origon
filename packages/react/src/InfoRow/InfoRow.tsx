import React, { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, spacing, radius, text, font } from '@origon/tokens-react';

export type InfoRowTone = 'info' | 'focus' | 'caution' | 'warning';
export type InfoRowPresence = 'low' | 'high';

export interface InfoRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  message: ReactNode;
  tone?: InfoRowTone;
  presence?: InfoRowPresence;
  boxed?: boolean;
  icon?: ReactNode;
  /** If provided, shows a close button and calls this when clicked. */
  onDismiss?: () => void;
}

// Container spec — height, padding, radius (Figma FK-InfoRow node 12:73137).
const CONTAINER = {
  height: 52,
  padding: `${spacing.md}px ${spacing.md}px`,
  radius: radius.sm,   // 12
  gap: spacing.sm,     // 12
  borderWidth: 1,
};

// Tone → (bg-low, bg-high, fg-low, fg-high, border) mapping.
type ToneColors = { bgLow: string; bgHigh: string; fgLow: string; fgHigh: string; border: string };
const TONE_MAP: Record<InfoRowTone, ToneColors> = {
  info: {
    bgLow:  colors.blueGray[200],
    bgHigh: colors.blueGray[300],
    fgLow:  semantic.text.focus,
    fgHigh: semantic.text.focus,
    border: colors.blueGray[300],
  },
  focus: {
    bgLow:  withAlpha(semantic.brand?.primary ?? colors.blue[600], 0.12),
    bgHigh: semantic.brand?.primary ?? colors.blue[600],
    fgLow:  semantic.brand?.primary ?? colors.blue[600],
    fgHigh: colors.base.white,
    border: semantic.brand?.primary ?? colors.blue[600],
  },
  caution: {
    bgLow:  withAlpha(colors.amber[600], 0.14),
    bgHigh: colors.amber[600],
    fgLow:  colors.amber[500],
    fgHigh: colors.blueGray[50],
    border: colors.amber[600],
  },
  warning: {
    bgLow:  withAlpha(colors.red[600], 0.14),
    bgHigh: colors.red[600],
    fgLow:  colors.red[400],
    fgHigh: colors.base.white,
    border: colors.red[600],
  },
};

export const InfoRow = forwardRef<HTMLDivElement, InfoRowProps>(function InfoRow(
  {
    message,
    tone = 'info',
    presence = 'low',
    boxed = true,
    icon,
    onDismiss,
    style,
    ...rest
  },
  ref,
) {
  const c = TONE_MAP[tone];
  const bg = presence === 'high' ? c.bgHigh : c.bgLow;
  const fg = presence === 'high' ? c.fgHigh : c.fgLow;

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: CONTAINER.gap,
    minHeight: CONTAINER.height,
    padding: CONTAINER.padding,
    borderRadius: boxed ? CONTAINER.radius : 0,
    border: boxed ? `${CONTAINER.borderWidth}px solid ${c.border}` : 'none',
    background: bg,
    color: fg,
    fontFamily: font.family.primary,
    fontSize: text.sm.fontSize,
    lineHeight: `${text.sm.lineHeight}px`,
    fontWeight: font.weight.regular,
    ...style,
  };

  return (
    <div ref={ref} role="status" aria-live="polite" style={containerStyle} {...rest}>
      {icon && (
        <span aria-hidden style={{ display: 'inline-flex', flex: '0 0 auto', width: 20, height: 20 }}>
          {icon}
        </span>
      )}
      <span style={{ flex: '1 1 auto', minWidth: 0 }}>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            padding: 0,
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.8,
          }}
        >
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden>
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
});

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
