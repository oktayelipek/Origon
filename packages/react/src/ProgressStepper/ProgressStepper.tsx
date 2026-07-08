import React, { type ReactNode } from 'react';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export interface Step {
  label?: ReactNode;
  /** Optional secondary text under the label. */
  description?: ReactNode;
}

export interface ProgressStepperProps {
  steps: Step[];
  /** Zero-based index of the current step. */
  active: number;
  /** Zero-based indices of completed steps. Defaults to all indices < active. */
  completed?: number[];
  orientation?: 'horizontal' | 'vertical';
  'aria-label'?: string;
}

/**
 * ProgressStepper — numbered progress dots + connecting lines.
 * Source: Figma `- Progress Stepper` (12:54443) / `- Progress wDot` (12:54273).
 */
export function ProgressStepper({ steps, active, completed, orientation = 'horizontal', 'aria-label': ariaLabel }: ProgressStepperProps) {
  const doneSet = new Set(completed ?? steps.map((_, i) => i).filter((i) => i < active));

  const isHorizontal = orientation === 'horizontal';
  const primary = semantic.button?.primary ?? colors.blue[600];

  return (
    <ol
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: 0,
        listStyle: 'none',
        margin: 0,
        padding: 0,
        fontFamily: font.family.primary,
      }}
    >
      {steps.map((step, i) => {
        const isDone = doneSet.has(i);
        const isActive = i === active;
        const isLast = i === steps.length - 1;
        const dotBg = isDone ? primary : isActive ? primary : colors.blueGray[300];
        const dotBorder = isDone || isActive ? primary : colors.blueGray[400];
        const dotFg = isDone || isActive ? colors.base.white : semantic.text.secondary;
        const lineFilled = isDone;

        return (
          <li
            key={i}
            aria-current={isActive ? 'step' : undefined}
            style={{
              display: 'flex',
              flexDirection: isHorizontal ? 'column' : 'row',
              alignItems: isHorizontal ? 'center' : 'flex-start',
              gap: isHorizontal ? spacing.xs : spacing.sm,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: isHorizontal ? 'row' : 'column',
                alignItems: 'center',
                gap: 0,
                width: isHorizontal ? '100%' : 24,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 24, height: 24,
                  borderRadius: 24,
                  background: dotBg,
                  border: `1px solid ${dotBorder}`,
                  color: dotFg,
                  fontSize: text.xs.fontSize,
                  fontWeight: font.weight.medium,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 auto',
                  transition: 'background 200ms ease',
                }}
              >
                {isDone ? (
                  <svg viewBox="0 0 12 12" width={12} height={12} fill="none">
                    <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : i + 1}
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  style={{
                    flex: 1,
                    background: lineFilled ? primary : colors.blueGray[300],
                    height: isHorizontal ? 2 : undefined,
                    width: isHorizontal ? undefined : 2,
                    minHeight: isHorizontal ? undefined : 24,
                    marginLeft: isHorizontal ? 4 : undefined,
                    marginRight: isHorizontal ? 4 : undefined,
                    marginTop: isHorizontal ? 0 : 4,
                    marginBottom: isHorizontal ? 0 : 4,
                    transition: 'background 200ms ease',
                  }}
                />
              )}
            </div>
            {(step.label || step.description) && (
              <div style={{ textAlign: isHorizontal ? 'center' : 'left', minWidth: 0, marginTop: isHorizontal ? spacing.xxs : 0 }}>
                {step.label && <div style={{ fontSize: text.sm.fontSize, color: isActive || isDone ? semantic.text.focus : semantic.text.secondary, fontWeight: font.weight.medium }}>{step.label}</div>}
                {step.description && <div style={{ fontSize: text.xs.fontSize, color: semantic.text.secondary, marginTop: 2 }}>{step.description}</div>}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
