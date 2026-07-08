import React, { useRef, type ReactNode } from 'react';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export interface TickerItem {
  key: string;
  content: ReactNode;
}

export interface TickerProps {
  items: TickerItem[];
  /** Loop duration in seconds. Higher = slower. */
  duration?: number;
  /** Pause the animation when the pointer hovers over it. */
  pauseOnHover?: boolean;
  /** Gap between items in px. */
  gap?: number;
  direction?: 'left' | 'right';
  className?: string;
}

/**
 * Ticker — infinite horizontal marquee for price feeds / announcements.
 * Source: Figma `- Ticker` (12:3551).
 * Duplicates the content once so the loop is seamless.
 */
export function Ticker({ items, duration = 40, pauseOnHover = true, gap = 40, direction = 'left', className }: TickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    gap,
    animation: `origonTickerScroll${direction === 'right' ? 'R' : 'L'} ${duration}s linear infinite`,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    willChange: 'transform',
  };

  return (
    <div
      className={className}
      role="marquee"
      aria-label="Ticker"
      style={{
        overflow: 'hidden',
        width: '100%',
        background: colors.blueGray[100],
        borderRadius: 8,
        padding: `${spacing.xs}px 0`,
        fontFamily: font.family.primary,
      }}
      onMouseEnter={(e) => { if (pauseOnHover) (e.currentTarget.firstElementChild as HTMLElement).style.animationPlayState = 'paused'; }}
      onMouseLeave={(e) => { if (pauseOnHover) (e.currentTarget.firstElementChild as HTMLElement).style.animationPlayState = 'running'; }}
    >
      <style>{`
        @keyframes origonTickerScrollL {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes origonTickerScrollR {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      <div ref={trackRef} style={trackStyle}>
        {items.map((it) => (
          <span key={it.key} style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs, fontSize: text.sm.fontSize, color: semantic.text.focus }}>
            {it.content}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {items.map((it) => (
          <span key={`${it.key}-dup`} aria-hidden style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs, fontSize: text.sm.fontSize, color: semantic.text.focus }}>
            {it.content}
          </span>
        ))}
      </div>
    </div>
  );
}
