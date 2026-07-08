import React, { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export interface FilterProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value'> {
  label: string;
  value?: ReactNode;
  /** When provided, shows a dismiss (×) button and calls this on click. */
  onDismiss?: () => void;
  /** Icons (e.g., token avatars) stacked to the left of the value. */
  leadingIcons?: ReactNode[];
}

/**
 * Filter — a compact pill button that surfaces a named filter's current value.
 * Clicking the body opens the filter picker; clicking the × dismisses.
 * Composed from Figma's `Header Filter` / `Header Filter [Icons]` components.
 */
export const Filter = forwardRef<HTMLButtonElement, FilterProps>(function Filter(
  { label, value, onDismiss, leadingIcons, style, disabled, ...rest },
  ref,
) {
  const bg = disabled ? colors.blueGray[100] : colors.blueGray[200];
  const fg = disabled ? semantic.text.disable : semantic.text.focus;

  const wrapper: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    height: 30,
    padding: `0 ${spacing.sm}px`,
    background: bg,
    border: 'none',
    borderRadius: radius.xxl,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: font.family.primary,
    fontSize: text.xs.fontSize,
    lineHeight: `${text.xs.lineHeight}px`,
    fontWeight: font.weight.medium,
    color: fg,
    ...style,
  };

  return (
    <button ref={ref} type="button" disabled={disabled} style={wrapper} {...rest}>
      <span style={{ color: semantic.text.secondary }}>{label}:</span>
      {leadingIcons && leadingIcons.length > 0 && (
        <span style={{ display: 'inline-flex' }}>
          {leadingIcons.map((ic, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                width: 16,
                height: 16,
                borderRadius: '50%',
                overflow: 'hidden',
                marginLeft: i === 0 ? 0 : -6,
                border: `1px solid ${bg}`,
              }}
            >
              {ic}
            </span>
          ))}
        </span>
      )}
      {value !== undefined && <span>{value}</span>}
      {onDismiss ? (
        <span
          role="button"
          aria-label="Clear filter"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: semantic.text.secondary }}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="7" fill={colors.blueGray[400]} />
            <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke={colors.blueGray[900]} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
      ) : (
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden style={{ color: semantic.text.secondary }}>
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
});

export interface SortFilterProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  direction?: 'asc' | 'desc' | null;
}

/** SortFilter — compact button that toggles column sort direction. */
export const SortFilter = forwardRef<HTMLButtonElement, SortFilterProps>(function SortFilter(
  { label, direction = null, style, ...rest },
  ref,
) {
  const wrapper: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xxs,
    height: 30,
    padding: `0 ${spacing.sm}px`,
    background: colors.blueGray[200],
    border: 'none',
    borderRadius: radius.xxl,
    cursor: 'pointer',
    fontFamily: font.family.primary,
    fontSize: text.xs.fontSize,
    lineHeight: `${text.xs.lineHeight}px`,
    fontWeight: font.weight.medium,
    color: semantic.text.focus,
    ...style,
  };

  return (
    <button ref={ref} type="button" style={wrapper} {...rest}>
      <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden>
        <path
          d={direction === 'desc' ? 'M6 2v8M3 7l3 3 3-3' : direction === 'asc' ? 'M6 10V2M3 5l3-3 3 3' : 'M4 4l2-2 2 2M4 8l2 2 2-2'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
      <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden style={{ color: semantic.text.secondary }}>
        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
});
