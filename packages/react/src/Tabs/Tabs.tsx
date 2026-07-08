import React, { useState, type ReactNode, type CSSProperties } from 'react';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export interface Tab {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'underline' | 'pill';
  /** When true, tabs stretch to fill the container. */
  fullWidth?: boolean;
  'aria-label'?: string;
}

/**
 * Tabs — horizontal navigation between related views. Source: Figma `{Tab}` (12:48473).
 * Two visual variants: `underline` (subtle bottom border) and `pill` (rounded active bg).
 */
export function Tabs({
  tabs, value, defaultValue, onChange, variant = 'underline', fullWidth = false, 'aria-label': ariaLabel,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.value);
  const active = value ?? internal;

  const activate = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  const listStyle: CSSProperties = {
    display: 'flex',
    gap: variant === 'pill' ? spacing.xxs : 0,
    borderBottom: variant === 'underline' ? `1px solid ${colors.blueGray[300]}` : 'none',
    padding: variant === 'pill' ? spacing.xxs : 0,
    background: variant === 'pill' ? colors.blueGray[200] : 'transparent',
    borderRadius: variant === 'pill' ? 999 : 0,
    width: fullWidth ? '100%' : 'fit-content',
  };

  return (
    <div role="tablist" aria-label={ariaLabel} style={listStyle}>
      {tabs.map((t) => {
        const isActive = t.value === active;
        const isPill = variant === 'pill';
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-disabled={t.disabled || undefined}
            disabled={t.disabled}
            onClick={() => !t.disabled && activate(t.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              padding: isPill ? `${spacing.xs}px ${spacing.md}px` : `${spacing.sm}px ${spacing.md}px`,
              background: isPill && isActive ? colors.blueGray[400] : 'transparent',
              color: t.disabled
                ? semantic.text.disable
                : isActive
                  ? (isPill ? semantic.text.focus : semantic.text.focus)
                  : semantic.text.secondary,
              border: 'none',
              borderRadius: isPill ? 999 : 0,
              borderBottom: !isPill ? `2px solid ${isActive ? semantic.button?.primary ?? colors.blue[600] : 'transparent'}` : undefined,
              cursor: t.disabled ? 'not-allowed' : 'pointer',
              fontFamily: font.family.primary,
              fontSize: text.sm.fontSize,
              fontWeight: font.weight.medium,
              transition: 'color 120ms ease, background 120ms ease, border-color 120ms ease',
              flex: fullWidth ? 1 : undefined,
              marginBottom: !isPill ? -1 : 0, // overlap the border for crispness
            }}
          >
            {t.icon && <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{t.icon}</span>}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
