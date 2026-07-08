import React, { forwardRef, createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export type RadioSize = 'small' | 'medium' | 'large';

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size: RadioSize;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: RadioSize;
  children: ReactNode;
  /** Layout — vertical stack (default) or horizontal row. */
  orientation?: 'vertical' | 'horizontal';
  'aria-label'?: string;
}

export function RadioGroup({
  name, value, onChange, disabled = false, size = 'medium', orientation = 'vertical', children, 'aria-label': ariaLabel,
}: RadioGroupProps) {
  const ctx: RadioGroupContextValue = { name, value, onChange, disabled, size };
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        gap: orientation === 'vertical' ? spacing.sm : spacing.md,
      }}
    >
      <RadioGroupContext.Provider value={ctx}>{children}</RadioGroupContext.Provider>
    </div>
  );
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value' | 'type'> {
  value: string;
  size?: RadioSize;
  label?: ReactNode;
  error?: boolean;
}

const SIZE_MAP: Record<RadioSize, { outer: number; inner: number }> = {
  large:  { outer: 22, inner: 10 },
  medium: { outer: 18, inner: 8 },
  small:  { outer: 14, inner: 6 },
};

/**
 * Radio — single choice within a RadioGroup. Source: Figma `FK-Radio` (12:54256).
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, size, label, error = false, id, style, ...rest }, ref,
) {
  const ctx = useContext(RadioGroupContext);
  const groupSize = ctx?.size ?? size ?? 'medium';
  const checked = ctx?.value === value;
  const disabled = ctx?.disabled ?? false;
  const dims = SIZE_MAP[groupSize];
  const autoId = React.useId();
  const inputId = id ?? autoId;

  const outer: CSSProperties = {
    position: 'relative',
    width: dims.outer,
    height: dims.outer,
    borderRadius: dims.outer,
    background: colors.blueGray[50],
    border: `1px solid ${error ? colors.red[600] : disabled ? colors.blueGray[400] : checked ? (semantic.button?.primary ?? colors.blue[600]) : colors.coolGray[700]}`,
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 120ms ease',
    flex: '0 0 auto',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const wrapper: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? semantic.text.disable : semantic.text.focus,
    fontFamily: font.family.primary,
    fontSize: text.md.fontSize,
    lineHeight: `${text.md.lineHeight}px`,
    userSelect: 'none',
    ...style,
  };

  return (
    <label htmlFor={inputId} style={wrapper}>
      <span style={outer}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          name={ctx?.name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={() => ctx?.onChange?.(value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, margin: 0, cursor: 'inherit' }}
          {...rest}
        />
        {checked && (
          <span
            aria-hidden
            style={{
              width: dims.inner,
              height: dims.inner,
              borderRadius: dims.inner,
              background: disabled ? colors.blueGray[400] : semantic.button?.primary ?? colors.blue[600],
              transition: 'background 120ms ease',
            }}
          />
        )}
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});
