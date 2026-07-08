import React, { forwardRef, type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export type CheckboxSize = 'small' | 'medium' | 'large';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'type'> {
  size?: CheckboxSize;
  checked?: boolean;
  disabled?: boolean;
  error?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
}

const SIZE_SPECS: Record<CheckboxSize, { box: number; radius: number; checkStroke: number; iconInset: number }> = {
  large:  { box: 24, radius: radius.xs, checkStroke: 2,   iconInset: 5 },
  medium: { box: 20, radius: radius.xs, checkStroke: 1.75, iconInset: 4 },
  small:  { box: 16, radius: radius.xxs, checkStroke: 1.5, iconInset: 3 },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { size = 'medium', checked = false, disabled = false, error = false, onChange, label, id, style, ...rest },
  ref,
) {
  const s = SIZE_SPECS[size];
  const autoId = React.useId();
  const inputId = id ?? autoId;

  const boxColors = (() => {
    if (disabled) return { bg: colors.blueGray[50], border: colors.coolGray[700] };
    if (error)    return { bg: colors.blueGray[50], border: colors.red[600] };
    if (checked)  return { bg: semantic.button?.primary ?? colors.blue[600], border: 'transparent' };
    return { bg: colors.blueGray[50], border: colors.coolGray[700] };
  })();

  const boxStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: s.box,
    height: s.box,
    borderRadius: s.radius,
    background: boxColors.bg,
    border: `1px solid ${boxColors.border}`,
    boxSizing: 'border-box',
    transition: 'background 120ms ease, border-color 120ms ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flex: '0 0 auto',
  };

  const wrapperStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? semantic.text.disable : semantic.text.focus,
    fontFamily: font.family.primary,
    fontSize: text.md.fontSize,
    lineHeight: `${text.md.lineHeight}px`,
    fontWeight: font.weight.regular,
    userSelect: 'none',
    ...style,
  };

  return (
    <label htmlFor={inputId} style={wrapperStyle}>
      <span style={boxStyle}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-invalid={error || undefined}
          onChange={(e) => onChange?.(e.target.checked)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            margin: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...rest}
        />
        {checked && !disabled && (
          <svg
            viewBox="0 0 24 24"
            width={s.box - s.iconInset * 2}
            height={s.box - s.iconInset * 2}
            fill="none"
            stroke={colors.base.white}
            strokeWidth={s.checkStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12l4 4 10-10" />
          </svg>
        )}
        {disabled && (
          <svg
            viewBox="0 0 24 24"
            width={s.box}
            height={s.box}
            fill="none"
            stroke={colors.coolGray[700]}
            strokeWidth={1}
            aria-hidden
            style={{ position: 'absolute' }}
          >
            <line x1="3" y1="21" x2="21" y2="3" />
          </svg>
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});
