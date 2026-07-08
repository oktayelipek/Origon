import React, { forwardRef, useState, type CSSProperties } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export interface PhoneInputProps {
  value?: string;
  onChange?: (national: string, countryCode: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
}

// Common country dial codes with flag emoji. TR default.
const COUNTRIES: { code: string; dial: string; flag: string; name: string }[] = [
  { code: 'TR', dial: '+90',  flag: '🇹🇷', name: 'Türkiye' },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Deutschland' },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'France' },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: 'JP', dial: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: 'RU', dial: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
];

/**
 * PhoneInput — country prefix + national number. Source: Figma FKInput
 * Feature=Phone / Phone (TR) variants (12:68514).
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    value = '',
    onChange,
    countryCode = 'TR',
    onCountryCodeChange,
    label,
    hint,
    error,
    disabled = false,
    fullWidth = false,
    placeholder = '5xx xxx xx xx',
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
  const hasError = !!error;

  const bg = disabled ? colors.blueGray[200] : focused && !hasError ? colors.blueGray[400] : colors.blueGray[200];
  const borderColor = hasError ? colors.red[600] : 'transparent';

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: spacing.xxs,
    fontFamily: font.family.primary,
    color: disabled ? semantic.text.disable : semantic.text.focus,
    width: fullWidth ? '100%' : undefined,
    position: 'relative',
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={{ fontSize: text.xs.fontSize, color: disabled ? semantic.text.disable : semantic.text.secondary, fontWeight: font.weight.medium, paddingLeft: 2 }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', gap: spacing.xs, height: 54, alignItems: 'stretch' }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setPickerOpen((o) => !o)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing.xs,
            padding: `0 ${spacing.md}px`,
            background: bg,
            border: 'none',
            borderRadius: radius.sm,
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: text.md.fontSize,
            cursor: disabled ? 'not-allowed' : 'pointer',
            minWidth: 96,
          }}
        >
          <span style={{ fontSize: 20 }}>{country.flag}</span>
          <span>{country.dial}</span>
          <svg viewBox="0 0 12 12" width="10" height="10" style={{ opacity: 0.6 }}>
            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 auto',
            padding: `0 ${spacing.md}px`,
            background: bg,
            border: `1px solid ${borderColor}`,
            borderRadius: radius.sm,
            transition: 'background 120ms ease',
          }}
        >
          <input
            ref={ref}
            type="tel"
            inputMode="tel"
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange?.(e.target.value.replace(/[^\d ]/g, ''), country.dial)}
            style={{
              flex: 1,
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: text.md.fontSize,
              minWidth: 0,
            }}
          />
        </div>
      </div>
      {pickerOpen && !disabled && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: label ? 78 : 60,
            left: 0,
            minWidth: 220,
            background: colors.blueGray[200],
            border: `1px solid ${colors.blueGray[400]}`,
            borderRadius: radius.sm,
            zIndex: 10,
            maxHeight: 240,
            overflow: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {COUNTRIES.map((c) => (
            <div
              key={c.code}
              role="option"
              aria-selected={c.code === countryCode}
              onClick={() => { onCountryCodeChange?.(c.code); setPickerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                padding: `${spacing.sm}px ${spacing.md}px`,
                cursor: 'pointer',
                background: c.code === countryCode ? colors.blueGray[400] : 'transparent',
                fontSize: text.sm.fontSize,
              }}
            >
              <span style={{ fontSize: 18 }}>{c.flag}</span>
              <span style={{ flex: 1 }}>{c.name}</span>
              <span style={{ opacity: 0.7 }}>{c.dial}</span>
            </div>
          ))}
        </div>
      )}
      {(hint || error) && (
        <span style={{ fontSize: text.xs.fontSize, color: error ? colors.red[500] : semantic.text.secondary, paddingLeft: 2 }}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
});
