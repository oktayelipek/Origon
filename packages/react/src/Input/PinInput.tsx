import React, { useRef, useEffect, type CSSProperties } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export interface PinInputProps {
  length?: 4 | 6;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  mask?: boolean;
  error?: string;
  label?: string;
  /** Accessible instructions for screen readers. */
  'aria-label'?: string;
}

/**
 * PinInput — segmented boxes for 4/6-digit codes (2FA, PIN entry).
 * Source: Figma FKInput Feature=Numeric / Encrypted variants (12:68514).
 *
 * Auto-advances on digit entry, backspaces to previous box on empty,
 * accepts paste of the whole code.
 */
export function PinInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  mask = false,
  error,
  label,
  'aria-label': ariaLabel,
}: PinInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length && onComplete) onComplete(value);
  }, [value, length, onComplete]);

  function setChar(i: number, ch: string) {
    const chars = value.split('');
    while (chars.length < length) chars.push('');
    chars[i] = ch;
    const next = chars.join('').slice(0, length);
    onChange(next);
  }

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    setChar(i, digit);
    // Advance focus.
    if (i < length - 1) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i]) {
      if (i > 0) {
        setChar(i - 1, '');
        inputsRef.current[i - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputsRef.current[i - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      setChar(i, '');
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  const hasError = !!error;

  const boxStyle = (filled: boolean): CSSProperties => ({
    width: 46,
    height: 54,
    borderRadius: radius.sm,
    border: `1px solid ${hasError ? colors.red[600] : filled ? colors.blueGray[500] : 'transparent'}`,
    background: disabled ? colors.blueGray[200] : filled ? colors.blueGray[400] : colors.blueGray[200],
    color: disabled ? semantic.text.disable : semantic.text.focus,
    textAlign: 'center',
    fontFamily: font.family.primary,
    fontSize: text.xl.fontSize,
    fontWeight: font.weight.medium,
    outline: 'none',
    transition: 'background 120ms ease, border-color 120ms ease',
  });

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: spacing.xxs, fontFamily: font.family.primary }}>
      {label && (
        <span style={{ fontSize: text.xs.fontSize, color: semantic.text.secondary, fontWeight: font.weight.medium, paddingLeft: 2 }}>
          {label}
        </span>
      )}
      <div
        role="group"
        aria-label={ariaLabel ?? label ?? `${length}-digit code`}
        style={{ display: 'inline-flex', gap: spacing.xs }}
      >
        {Array.from({ length }, (_, i) => {
          const ch = value[i] ?? '';
          return (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type={mask ? 'password' : 'tel'}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              disabled={disabled}
              aria-label={`Digit ${i + 1}`}
              value={mask && ch ? '•' : ch}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              style={boxStyle(!!ch)}
            />
          );
        })}
      </div>
      {(error) && (
        <span style={{ fontSize: text.xs.fontSize, color: colors.red[500], paddingLeft: 2 }}>{error}</span>
      )}
    </div>
  );
}
