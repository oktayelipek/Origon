import React, { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, spacing, text, font, radius } from '@origon/tokens-react';

export type ToggleSize = 'small' | 'medium' | 'large';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'type'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ToggleSize;
  label?: ReactNode;
  /** Show label on the left instead of right. */
  labelPosition?: 'left' | 'right';
}

const SIZE_MAP: Record<ToggleSize, { track: [number, number]; thumb: number; padding: number }> = {
  large:  { track: [44, 26], thumb: 22, padding: 2 },
  medium: { track: [36, 22], thumb: 18, padding: 2 },
  small:  { track: [28, 16], thumb: 12, padding: 2 },
};

/**
 * Toggle — boolean switch (iOS-style). Source: Figma `{FK-Toggle}` (12:3011).
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { checked = false, onChange, size = 'medium', label, labelPosition = 'right', disabled = false, id, style, ...rest },
  ref,
) {
  const dims = SIZE_MAP[size];
  const autoId = React.useId();
  const inputId = id ?? autoId;

  const trackBg = disabled
    ? colors.blueGray[300]
    : checked
      ? (semantic.button?.primary ?? colors.blue[600])
      : colors.blueGray[400];

  const trackStyle: CSSProperties = {
    position: 'relative',
    width: dims.track[0],
    height: dims.track[1],
    borderRadius: dims.track[1] / 2,
    background: trackBg,
    transition: 'background 160ms ease',
    flex: '0 0 auto',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
  const thumbStyle: CSSProperties = {
    position: 'absolute',
    top: dims.padding,
    left: checked ? dims.track[0] - dims.thumb - dims.padding : dims.padding,
    width: dims.thumb,
    height: dims.thumb,
    borderRadius: dims.thumb,
    background: colors.base.white,
    boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
    transition: 'left 160ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const track = (
    <span style={trackStyle}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ position: 'absolute', inset: 0, opacity: 0, margin: 0, cursor: 'inherit' }}
        {...rest}
      />
      <span aria-hidden style={thumbStyle} />
    </span>
  );

  if (!label) return <label htmlFor={inputId} style={{ display: 'inline-block', cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>{track}</label>;

  return (
    <label
      htmlFor={inputId}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.sm,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? semantic.text.disable : semantic.text.focus,
        fontFamily: font.family.primary,
        fontSize: text.md.fontSize,
        userSelect: 'none',
        ...style,
      }}
    >
      {labelPosition === 'left' && <span>{label}</span>}
      {track}
      {labelPosition === 'right' && <span>{label}</span>}
    </label>
  );
});
