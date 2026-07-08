import React, { forwardRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonVariant = 'primary' | 'focus' | 'outline' | 'ghost';
export type ButtonPresence = 'default' | 'subtle';
export type ButtonIconPosition = 'leading' | 'trailing' | 'only';
export type ButtonDirection = 'horizontal' | 'vertical';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  presence?: ButtonPresence;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
  children?: ReactNode;
  fullWidth?: boolean;
  /** Icon+text layout — horizontal (default) or stacked vertically (icon on top). */
  direction?: ButtonDirection;
}

// -----------------------------------------------------------------------------
// Size specs — extracted from Figma component set {FKButton} (node 8:135).
// Each size defines the horizontal padding, vertical padding, corner radius,
// and text scale used across all style variants at that size.
// -----------------------------------------------------------------------------
const SIZE_SPECS: Record<ButtonSize, {
  paddingX: number;
  paddingY: number;
  radius: number;
  height: number;
  textSize: number;
  textLineHeight: number;
  iconSize: number;
  gap: number;
}> = {
  large: {
    paddingX: spacing['5xl'],   // 48
    paddingY: spacing.sm,       // 12
    radius: radius.sm,          // 12
    height: 44,
    textSize: text.md.fontSize,       // 15
    textLineHeight: text.md.lineHeight, // 20
    iconSize: 20,
    gap: spacing.xs,            // 8
  },
  medium: {
    paddingX: spacing['4xl'],   // 40
    paddingY: spacing.xs,       // 8
    radius: radius.xs,          // 8
    height: 34,
    textSize: text.sm.fontSize,       // 13
    textLineHeight: text.sm.lineHeight, // 18
    iconSize: 16,
    gap: spacing.xs,
  },
  small: {
    paddingX: spacing.sm,       // 12
    paddingY: spacing.xxs,      // 4
    radius: radius.xxl,         // 28 — pill shape
    height: 22,
    textSize: text.xs.fontSize,       // 11
    textLineHeight: text.xs.lineHeight, // 14
    iconSize: 14,
    gap: spacing.xxs,
  },
};

// -----------------------------------------------------------------------------
// Style specs — background, border, and text color for each variant × state.
// Values come from Figma variables (Kripto Dark mode). When theming lands,
// these will read from CSS custom properties or a ThemeProvider.
// -----------------------------------------------------------------------------
type StyleState = 'default' | 'hover' | 'active' | 'disabled';

function stylesFor(variant: ButtonVariant, presence: ButtonPresence, state: StyleState) {
  const bases: Record<ButtonVariant, {
    bg: string;
    fg: string;
    border: string | null;
    hoverBg?: string;
    activeBg?: string;
  }> = {
    primary: {
      bg: semantic.button.primary,     // #005fae
      fg: colors.base.white,
      border: null,
      hoverBg: shade(semantic.button.primary, -0.08),
      activeBg: shade(semantic.button.primary, -0.16),
    },
    focus: {
      bg: semantic.button.focus,       // #f0f4f7
      fg: colors.blueGray[50],         // near-black
      border: null,
      hoverBg: shade(semantic.button.focus, -0.06),
      activeBg: shade(semantic.button.focus, -0.12),
    },
    outline: {
      bg: 'transparent',
      fg: semantic.text.focus,         // #f0f4f7
      border: semantic.border.level5,  // #21374a
      hoverBg: 'rgba(240,244,247,0.06)',
      activeBg: 'rgba(240,244,247,0.10)',
    },
    ghost: {
      bg: 'transparent',
      fg: semantic.text.focus,
      border: null,
      hoverBg: 'rgba(240,244,247,0.06)',
      activeBg: 'rgba(240,244,247,0.10)',
    },
  };
  const base = bases[variant];

  if (state === 'disabled') {
    return {
      bg: variant === 'outline' || variant === 'ghost' ? 'transparent' : semantic.button.disable,
      fg: semantic.text.disable,
      border: variant === 'outline' ? semantic.border.level2 : null,
    };
  }

  const bg = state === 'active' ? (base.activeBg ?? base.bg)
           : state === 'hover'  ? (base.hoverBg ?? base.bg)
           : base.bg;

  // Presence = subtle → lower saturation via alpha overlay for solid variants.
  if (presence === 'subtle' && (variant === 'primary' || variant === 'focus')) {
    return {
      bg: withAlpha(base.bg, 0.16),
      fg: base.bg,   // subtle uses the primary color as text
      border: null,
    };
  }
  return { bg, fg: base.fg, border: base.border };
}

// -----------------------------------------------------------------------------
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    size = 'large',
    variant = 'primary',
    presence = 'default',
    icon,
    iconPosition = 'leading',
    children,
    fullWidth = false,
    disabled = false,
    direction = 'horizontal',
    style,
    ...rest
  },
  ref,
) {
  const spec = SIZE_SPECS[size];
  const [state, setState] = useState<StyleState>('default');
  const effectiveState: StyleState = disabled ? 'disabled' : state;
  const s = stylesFor(variant, presence, effectiveState);

  const iconOnly = iconPosition === 'only' || (!children && icon);
  const isVertical = direction === 'vertical' && !iconOnly && !!icon;

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isVertical ? spec.gap / 2 : spec.gap,
    height: isVertical ? 'auto' : spec.height,
    padding: iconOnly
      ? `${spec.paddingY}px ${spec.paddingY}px`
      : isVertical
        ? `${spec.paddingY}px ${spec.paddingY * 2}px`
        : `${spec.paddingY}px ${spec.paddingX}px`,
    minWidth: iconOnly ? spec.height : undefined,
    background: s.bg,
    color: s.fg,
    border: s.border ? `1px solid ${s.border}` : 'none',
    borderRadius: spec.radius,
    fontFamily: font.family.primary,
    fontSize: spec.textSize,
    lineHeight: `${spec.textLineHeight}px`,
    fontWeight: font.weight.medium,
    letterSpacing: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease, transform 120ms ease',
    userSelect: 'none',
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      style={buttonStyle}
      onPointerEnter={() => !disabled && setState('hover')}
      onPointerLeave={() => !disabled && setState('default')}
      onPointerDown={() => !disabled && setState('active')}
      onPointerUp={() => !disabled && setState('hover')}
      onBlur={() => !disabled && setState('default')}
      {...rest}
    >
      {icon && (iconPosition === 'leading' || iconPosition === 'only') && (
        <span aria-hidden style={{ display: 'inline-flex', width: spec.iconSize, height: spec.iconSize }}>{icon}</span>
      )}
      {children && iconPosition !== 'only' && <span>{children}</span>}
      {icon && iconPosition === 'trailing' && (
        <span aria-hidden style={{ display: 'inline-flex', width: spec.iconSize, height: spec.iconSize }}>{icon}</span>
      )}
    </button>
  );
});

// -----------------------------------------------------------------------------
// Local color utilities. When token pipeline supports references, these can be
// replaced by pre-computed hover/active tokens from Figma.
// -----------------------------------------------------------------------------
function shade(hex: string, ratio: number): string {
  // Positive ratio lightens, negative darkens.
  const [r, g, b] = hexToRgb(hex);
  const adjust = (c: number) => Math.round(Math.max(0, Math.min(255, c + (ratio < 0 ? c * ratio : (255 - c) * ratio))));
  return rgbToHex(adjust(r), adjust(g), adjust(b));
}
function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}
