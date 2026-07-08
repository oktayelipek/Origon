import React, { type SVGAttributes } from 'react';

// Minimal starter icon set. The Figma "Icons + Logos" library has hundreds of
// icons; the full export pipeline (Figma REST `/v1/images?ids=…&format=svg` →
// SVGO → per-icon components) is a v2 task. This v1 exposes the small set
// used in the design system's own docs.

const ICONS = {
  check:   'M5 12l4 4 10-10',
  close:   'M5 5l14 14M19 5L5 19',
  chevronDown:  'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  info:    'M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  alert:   'M12 9v4M12 17h.01M4.5 20h15L12 4z',
  star:    'M12 2l3 7 7 .5-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.7L2 9.5 9 9z',
  search:  'M11 4a7 7 0 105 12l4 4M11 4a7 7 0 015 12',
  plus:    'M12 5v14M5 12h14',
  minus:   'M5 12h14',
  arrowUp: 'M12 4v16M6 10l6-6 6 6',
  arrowDown: 'M12 4v16M6 14l6 6 6-6',
} as const;

export type IconName = keyof typeof ICONS;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
}

/**
 * Icon — starter set of common UI glyphs. All icons are line-style, 24×24
 * viewBox, single `currentColor` stroke. Consumers control size and color
 * through standard CSS.
 */
export function Icon({ name, size = 20, style, ...rest }: IconProps) {
  const d = ICONS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', flex: '0 0 auto', ...style }}
      aria-hidden
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

export const ICON_NAMES = Object.keys(ICONS) as IconName[];
