import React, { useState, type ReactNode } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export interface SegmentedOption<T = string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T = string> {
  options: SegmentedOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  'aria-label'?: string;
}

/**
 * SegmentedControl — mutually-exclusive choice group with a sliding selected
 * indicator. Source: Figma `- Segmented Control` (12:49453). Good for
 * chart timespans, sort orders, view modes.
 */
export function SegmentedControl<T = string>({
  options, value, defaultValue, onChange, size = 'medium', fullWidth = false, 'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  const [internal, setInternal] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  const active = value ?? internal;

  const activate = (v: T) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  const height = size === 'small' ? 30 : 38;
  const fontSize = size === 'small' ? text.xs.fontSize : text.sm.fontSize;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        background: colors.blueGray[200],
        borderRadius: radius.xxl,
        width: fullWidth ? '100%' : 'fit-content',
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-disabled={opt.disabled || undefined}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && activate(opt.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xxs,
              height,
              padding: `0 ${spacing.md}px`,
              background: isActive ? colors.blueGray[400] : 'transparent',
              color: opt.disabled ? semantic.text.disable : isActive ? semantic.text.focus : semantic.text.secondary,
              border: 'none',
              borderRadius: radius.xxl,
              cursor: opt.disabled ? 'not-allowed' : 'pointer',
              fontFamily: font.family.primary,
              fontSize,
              fontWeight: isActive ? font.weight.medium : font.weight.regular,
              transition: 'background 160ms ease, color 160ms ease',
              flex: fullWidth ? 1 : undefined,
            }}
          >
            {opt.icon && <span style={{ display: 'inline-flex', width: 14, height: 14 }}>{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
