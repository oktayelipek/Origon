import React, { forwardRef, useState, type InputHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export type InputSize = 'large' | 'small' | 'x-small';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

// From Figma FKInput component set (12:68514). Size heights: Large 54, Small ~44, X-Small 32.
const SIZE_SPECS: Record<InputSize, {
  height: number;
  paddingX: number;
  textSize: number;
  textLineHeight: number;
  labelSize: number;
  iconSize: number;
}> = {
  large:     { height: 54, paddingX: spacing.md, textSize: text.md.fontSize,  textLineHeight: text.md.lineHeight, labelSize: text.xs.fontSize, iconSize: 20 },
  small:     { height: 44, paddingX: spacing.md, textSize: text.sm.fontSize,  textLineHeight: text.sm.lineHeight, labelSize: text.xs.fontSize, iconSize: 18 },
  'x-small': { height: 32, paddingX: spacing.sm, textSize: text.xs.fontSize,  textLineHeight: text.xs.lineHeight, labelSize: text.xxs.fontSize, iconSize: 14 },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'large',
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled = false,
    id,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const s = SIZE_SPECS[size];
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const [focused, setFocused] = useState(false);

  const bg = disabled ? colors.blueGray[200]
           : error    ? colors.blueGray[200]
           : focused  ? colors.blueGray[400]
                      : colors.blueGray[200];
  const border = error ? colors.red[600] : 'transparent';

  const wrapperStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: spacing.xxs,
    fontFamily: font.family.primary,
    color: disabled ? semantic.text.disable : semantic.text.focus,
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  const boxStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    height: s.height,
    padding: `0 ${s.paddingX}px`,
    background: bg,
    borderRadius: radius.sm,
    border: `1px solid ${border}`,
    transition: 'background 120ms ease, border-color 120ms ease',
  };

  const inputStyle: CSSProperties = {
    flex: '1 1 auto',
    minWidth: 0,
    height: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: s.textSize,
    lineHeight: `${s.textLineHeight}px`,
    fontWeight: font.weight.regular,
  };

  return (
    <div style={wrapperStyle}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: s.labelSize,
            color: disabled ? semantic.text.disable : semantic.text.secondary,
            fontWeight: font.weight.medium,
            paddingLeft: 2,
          }}
        >
          {label}
        </label>
      )}
      <div style={boxStyle}>
        {leftIcon && (
          <span aria-hidden style={{ display: 'inline-flex', width: s.iconSize, height: s.iconSize, flex: '0 0 auto', color: semantic.text.secondary }}>
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={inputStyle}
          {...rest}
        />
        {rightIcon && (
          <span aria-hidden style={{ display: 'inline-flex', width: s.iconSize, height: s.iconSize, flex: '0 0 auto', color: semantic.text.secondary }}>
            {rightIcon}
          </span>
        )}
      </div>
      {(hint || error) && (
        <span
          id={error ? `${inputId}-error` : `${inputId}-hint`}
          style={{
            fontSize: s.labelSize,
            color: error ? colors.red[500] : semantic.text.secondary,
            paddingLeft: 2,
          }}
        >
          {error ?? hint}
        </span>
      )}
    </div>
  );
});
