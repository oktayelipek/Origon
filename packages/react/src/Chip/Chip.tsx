import React, { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export type ChipSize = 'xs' | 'sm' | 'md' | 'lg';
export type ChipVariant = 'line' | 'solid';

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  size?: ChipSize;
  variant?: ChipVariant;
  /** When defined, chip becomes a toggle button (see also `onSelect`). */
  selected?: boolean;
  onSelect?: (next: boolean) => void;
  icon?: ReactNode;
  children: ReactNode;
}

// Sizes from Figma Chip component set (12:86248).
const SIZE_SPECS: Record<ChipSize, {
  paddingX: number;
  paddingY: number;
  height: number;
  textSize: number;
  textLineHeight: number;
  gap: number;
  iconSize: number;
}> = {
  lg: { paddingX: spacing['4xl'], paddingY: spacing.md, height: 46, textSize: text.md.fontSize, textLineHeight: text.md.lineHeight, gap: spacing.xs, iconSize: 20 },
  md: { paddingX: spacing['3xl'], paddingY: spacing.sm, height: 38, textSize: text.sm.fontSize, textLineHeight: text.sm.lineHeight, gap: spacing.xs, iconSize: 18 },
  sm: { paddingX: spacing.xl,    paddingY: spacing.xs,  height: 30, textSize: text.xs.fontSize, textLineHeight: text.xs.lineHeight, gap: spacing.xxs, iconSize: 14 },
  xs: { paddingX: spacing.xs,    paddingY: spacing.xxs, height: 20, textSize: text.xs.fontSize, textLineHeight: text.xs.lineHeight, gap: spacing.xxs, iconSize: 12 },
};

// Interactive selector — selected=true fills with brand primary.
function selectorColors(selected: boolean): { bg: string; fg: string; border: string | null } {
  if (selected) {
    return { bg: semantic.button?.primary ?? colors.blue[600], fg: colors.base.white, border: null };
  }
  return { bg: 'transparent', fg: semantic.text.focus, border: colors.blueGray[300] };
}

// Display chip — variant line (outline) or solid (filled with subtle bg).
function displayColors(variant: ChipVariant): { bg: string; fg: string; border: string | null } {
  if (variant === 'solid') {
    return { bg: colors.blueGray[200], fg: semantic.text.focus, border: colors.blueGray[200] };
  }
  return { bg: 'transparent', fg: semantic.text.focus, border: colors.blueGray[200] };
}

export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  {
    size = 'md',
    variant = 'line',
    selected,
    onSelect,
    icon,
    children,
    style,
    ...rest
  },
  ref,
) {
  const spec = SIZE_SPECS[size];
  const interactive = onSelect !== undefined || selected !== undefined;
  const colors_ = interactive ? selectorColors(!!selected) : displayColors(variant);

  const chipStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spec.gap,
    height: spec.height,
    padding: `${spec.paddingY}px ${spec.paddingX}px`,
    background: colors_.bg,
    color: colors_.fg,
    border: colors_.border ? `1px solid ${colors_.border}` : 'none',
    borderRadius: radius.xxl,
    fontFamily: font.family.primary,
    fontSize: spec.textSize,
    lineHeight: `${spec.textLineHeight}px`,
    fontWeight: font.weight.medium,
    cursor: interactive ? 'pointer' : 'default',
    outline: 'none',
    transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
    userSelect: 'none',
    ...style,
  };

  const content = (
    <>
      {icon && (
        <span aria-hidden style={{ display: 'inline-flex', width: spec.iconSize, height: spec.iconSize }}>{icon}</span>
      )}
      <span>{children}</span>
    </>
  );

  if (interactive) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        role="switch"
        aria-checked={!!selected}
        onClick={() => onSelect?.(!selected)}
        style={chipStyle}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} style={chipStyle} {...rest}>
      {content}
    </span>
  );
});
