import React, { forwardRef, useState, type TextareaHTMLAttributes, type CSSProperties } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export interface MultiLineInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  /** Minimum visible rows. */
  rows?: number;
  /** Enable auto-resize as the user types (grows up to `maxRows`). */
  autoResize?: boolean;
  maxRows?: number;
  fullWidth?: boolean;
  /** Show a character counter using `maxLength`. */
  showCounter?: boolean;
}

/**
 * MultiLineInput — textarea variant of Input. Source: Figma FKInput
 * Feature=Multi Line (12:68514). Supports optional auto-resize.
 */
export const MultiLineInput = forwardRef<HTMLTextAreaElement, MultiLineInputProps>(function MultiLineInput(
  {
    label, hint, error, rows = 3, autoResize = false, maxRows = 8,
    fullWidth = false, showCounter = false, maxLength, id, disabled, style,
    onChange, onFocus, onBlur, defaultValue, value, ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [internalLength, setInternalLength] = useState(String(defaultValue ?? value ?? '').length);
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const hasError = !!error;

  const bg = disabled ? colors.blueGray[200] : focused && !hasError ? colors.blueGray[400] : colors.blueGray[200];
  const borderColor = hasError ? colors.red[600] : 'transparent';

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalLength(e.target.value.length);
    if (autoResize) {
      e.target.style.height = 'auto';
      const lineHeight = text.md.lineHeight;
      const maxHeight = maxRows * lineHeight + spacing.md * 2;
      const nextHeight = Math.min(e.target.scrollHeight, maxHeight);
      e.target.style.height = `${nextHeight}px`;
    }
    onChange?.(e);
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: spacing.xxs, fontFamily: font.family.primary, width: fullWidth ? '100%' : undefined, ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: text.xs.fontSize, color: disabled ? semantic.text.disable : semantic.text.secondary, fontWeight: font.weight.medium, paddingLeft: 2 }}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        value={value}
        defaultValue={defaultValue}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        onChange={handleInput}
        style={{
          background: bg,
          color: disabled ? semantic.text.disable : semantic.text.focus,
          border: `1px solid ${borderColor}`,
          borderRadius: radius.sm,
          padding: `${spacing.sm}px ${spacing.md}px`,
          fontFamily: 'inherit',
          fontSize: text.md.fontSize,
          lineHeight: `${text.md.lineHeight}px`,
          fontWeight: font.weight.regular,
          outline: 'none',
          resize: autoResize ? 'none' : 'vertical',
          transition: 'background 120ms ease, border-color 120ms ease',
          minHeight: rows * text.md.lineHeight + spacing.md * 2,
          maxHeight: maxRows * text.md.lineHeight + spacing.md * 2,
        }}
        {...rest}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 2, paddingRight: 2 }}>
        <span
          id={hasError ? `${inputId}-error` : `${inputId}-hint`}
          style={{ fontSize: text.xs.fontSize, color: hasError ? colors.red[500] : semantic.text.secondary }}
        >
          {error ?? hint ?? ''}
        </span>
        {showCounter && maxLength !== undefined && (
          <span style={{ fontSize: text.xs.fontSize, color: internalLength >= maxLength ? colors.red[500] : semantic.text.secondary }}>
            {internalLength} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
});
