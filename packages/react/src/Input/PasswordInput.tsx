import React, { forwardRef, useState, useMemo, type CSSProperties } from 'react';
import { Input, type InputProps } from './Input';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export type PasswordStrength = 'weak' | 'middle' | 'strong';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon' | 'hint'> {
  /** Show strength meter below the field. */
  showStrengthMeter?: boolean;
  /** Custom strength calculator. Defaults to a length + character-class score. */
  scoreStrength?: (value: string) => PasswordStrength;
  /** Optional helper hint (overridden by strength label when meter shown). */
  hint?: string;
}

const DEFAULT_SCORE = (v: string): PasswordStrength => {
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  return score <= 2 ? 'weak' : score <= 3 ? 'middle' : 'strong';
};

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak:   colors.red[500],
  middle: colors.amber[500],
  strong: colors.green[600],
};
const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  weak: 'Weak', middle: 'Medium', strong: 'Strong',
};

/**
 * PasswordInput — masked field with visibility toggle and optional strength
 * meter. Source: Figma FKInput Feature + Input/Password Helper (12:68514).
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  {
    showStrengthMeter = false,
    scoreStrength = DEFAULT_SCORE,
    hint,
    value,
    defaultValue,
    onChange,
    ...rest
  },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const [internal, setInternal] = useState(defaultValue?.toString() ?? '');
  const currentValue = value !== undefined ? String(value) : internal;

  const strength = useMemo(
    () => scoreStrength(currentValue),
    [currentValue, scoreStrength],
  );

  const toggle = (
    <button
      type="button"
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      onClick={() => setVisible((v) => !v)}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {visible ? (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          <path d="M4 4l16 16" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <div>
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => {
          if (value === undefined) setInternal(e.target.value);
          onChange?.(e);
        }}
        rightIcon={toggle}
        hint={showStrengthMeter && currentValue ? undefined : hint}
        {...rest}
      />
      {showStrengthMeter && currentValue && (
        <StrengthMeter strength={strength} />
      )}
    </div>
  );
});

function StrengthMeter({ strength }: { strength: PasswordStrength }) {
  const filled = strength === 'weak' ? 1 : strength === 'middle' ? 2 : 3;
  const color = STRENGTH_COLORS[strength];
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxs,
    paddingLeft: 2,
  };
  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: 4, flex: '0 0 auto' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 24,
              height: 4,
              borderRadius: 2,
              background: i < filled ? color : colors.blueGray[300],
              transition: 'background 200ms ease',
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: font.family.primary,
          fontSize: text.xs.fontSize,
          color,
          fontWeight: font.weight.medium,
        }}
      >
        {STRENGTH_LABELS[strength]}
      </span>
    </div>
  );
}
