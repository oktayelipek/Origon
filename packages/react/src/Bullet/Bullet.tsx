import React, { forwardRef, type CSSProperties } from 'react';
import { semantic, colors, radius, spacing } from '@origon/tokens-react';

export type BulletVariant = 'line' | 'dots';

export interface BulletProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: BulletVariant;
  count: number;
  /** 0-based index of the active step. */
  active: number;
}

// Sizes from Figma Bullet [Line]/[Dots] (nodes 8:837 / 8:866).
const ITEM_SPECS: Record<BulletVariant, { width: number; height: number }> = {
  line: { width: 40, height: 4 },
  dots: { width: 8, height: 8 },
};

// ON = focus color (near-white), OFF = blueGray/300 (subtle dark). Both use
// fully-rounded corners (radius 28 in Figma; > half of any dimension → pill).
const ON_COLOR = semantic.text.focus;
const OFF_COLOR = colors.blueGray[300];

export const Bullet = forwardRef<HTMLDivElement, BulletProps>(function Bullet(
  { variant = 'dots', count, active, style, ...rest },
  ref,
) {
  const item = ITEM_SPECS[variant];
  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    ...style,
  };
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={`Step ${active + 1} of ${count}`}
      style={containerStyle}
      {...rest}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          aria-current={i === active ? 'step' : undefined}
          style={{
            display: 'inline-block',
            width: item.width,
            height: item.height,
            borderRadius: radius.xxl,
            background: i === active ? ON_COLOR : OFF_COLOR,
            transition: 'background 160ms ease',
          }}
        />
      ))}
    </div>
  );
});
