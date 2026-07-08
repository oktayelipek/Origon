import React, { type CSSProperties, type ReactNode } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export type KeyboardLayout = 'numeric' | 'decimal';

export interface KeyboardProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: KeyboardLayout;
  onKey?: (key: string) => void;
  onBackspace?: () => void;
  onConfirm?: () => void;
  /** Content of the confirm key (bottom-right). Set to null to hide. */
  confirmContent?: ReactNode;
}

/**
 * Keyboard — on-screen numpad tuned for TL-crypto trading inputs.
 * Source: Figma `- Keyboards` (`12:58173`). Ships numeric and decimal
 * layouts; full QWERTY variants defer to platform keyboards.
 */
export function Keyboard({
  layout = 'numeric',
  onKey,
  onBackspace,
  onConfirm,
  confirmContent,
  style,
  ...rest
}: KeyboardProps) {
  // 3×4 grid — digits + optional "." + backspace + confirm.
  const bottomLeft: string | null = layout === 'decimal' ? '.' : null;
  const keys: (string | 'backspace' | 'confirm' | null)[] = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    bottomLeft, '0', 'backspace',
  ];

  const containerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacing.xs,
    padding: spacing.sm,
    background: colors.blueGray[100],
    borderRadius: radius.sm,
    fontFamily: font.family.primary,
    ...style,
  };

  return (
    <div style={containerStyle} {...rest}>
      {keys.map((k, i) => {
        if (k === null) return <span key={i} />;
        if (k === 'backspace') {
          return (
            <button
              key={i}
              type="button"
              aria-label="Backspace"
              onClick={onBackspace}
              style={keyStyle({ role: 'action' })}
            >
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 5H8L2 12l6 7h14z" />
                <path d="M18 9l-6 6M12 9l6 6" />
              </svg>
            </button>
          );
        }
        return (
          <button
            key={i}
            type="button"
            aria-label={`Key ${k}`}
            onClick={() => onKey?.(k)}
            style={keyStyle({ role: 'digit' })}
          >
            {k}
          </button>
        );
      })}
      {onConfirm && (
        <button
          type="button"
          aria-label="Confirm"
          onClick={onConfirm}
          style={{ ...keyStyle({ role: 'confirm' }), gridColumn: '1 / -1' }}
        >
          {confirmContent ?? '✓'}
        </button>
      )}
    </div>
  );
}

function keyStyle({ role }: { role: 'digit' | 'action' | 'confirm' }): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    padding: 0,
    borderRadius: radius.sm,
    border: 'none',
    fontFamily: 'inherit',
    fontSize: text.xl.fontSize,
    lineHeight: `${text.xl.lineHeight}px`,
    fontWeight: font.weight.medium,
    cursor: 'pointer',
    userSelect: 'none',
  };
  if (role === 'confirm') {
    return { ...base, background: semantic.button?.primary ?? colors.blue[600], color: colors.base.white };
  }
  if (role === 'action') {
    return { ...base, background: colors.blueGray[200], color: semantic.text.focus };
  }
  return { ...base, background: colors.blueGray[200], color: semantic.text.focus };
}
