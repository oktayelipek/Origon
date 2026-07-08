import React, { useState, useRef, useLayoutEffect, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: React.ReactElement;
  side?: TooltipSide;
  /** Show/hide delay in ms. */
  delay?: number;
  disabled?: boolean;
}

/**
 * Tooltip — hover/focus popover with arrow. Portals to document.body.
 * Source: Figma `{FK-Tooltip}` (11:2720).
 */
export function Tooltip({ content, children, side = 'top', delay = 250, disabled = false }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; placement: TooltipSide }>({ top: 0, left: 0, placement: side });
  const anchorRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !tooltipRef.current) return;
    const anchor = anchorRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    const gap = 8;
    let top = 0, left = 0, placement = side;
    switch (side) {
      case 'top':
        top = anchor.top - tip.height - gap;
        left = anchor.left + anchor.width / 2 - tip.width / 2;
        if (top < 4) { placement = 'bottom'; top = anchor.bottom + gap; }
        break;
      case 'bottom':
        top = anchor.bottom + gap;
        left = anchor.left + anchor.width / 2 - tip.width / 2;
        if (top + tip.height > window.innerHeight - 4) { placement = 'top'; top = anchor.top - tip.height - gap; }
        break;
      case 'left':
        top = anchor.top + anchor.height / 2 - tip.height / 2;
        left = anchor.left - tip.width - gap;
        if (left < 4) { placement = 'right'; left = anchor.right + gap; }
        break;
      case 'right':
        top = anchor.top + anchor.height / 2 - tip.height / 2;
        left = anchor.right + gap;
        if (left + tip.width > window.innerWidth - 4) { placement = 'left'; left = anchor.left - tip.width - gap; }
        break;
    }
    // Clamp to viewport with 4px margin.
    left = Math.max(4, Math.min(window.innerWidth - tip.width - 4, left));
    top = Math.max(4, Math.min(window.innerHeight - tip.height - 4, top));
    setPos({ top, left, placement });
  }, [open, side]);

  const show = () => {
    if (disabled) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timerRef.current);
    setOpen(false);
  };

  const trigger = React.cloneElement(children as React.ReactElement<any>, {
    ref: (n: HTMLElement | null) => {
      anchorRef.current = n;
      const { ref } = children as any;
      if (typeof ref === 'function') ref(n);
      else if (ref) ref.current = n;
    },
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      (children.props as any).onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      (children.props as any).onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      (children.props as any).onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      (children.props as any).onBlur?.(e);
    },
  });

  const tipStyle: CSSProperties = {
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    background: colors.blueGray[100],
    color: semantic.text.focus,
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: radius.xs,
    fontSize: text.xs.fontSize,
    fontFamily: font.family.primary,
    fontWeight: font.weight.regular,
    lineHeight: `${text.xs.lineHeight}px`,
    boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
    zIndex: 2000,
    pointerEvents: 'none',
    maxWidth: 240,
  };

  return (
    <>
      {trigger}
      {open && typeof document !== 'undefined' && createPortal(
        <div ref={tooltipRef} role="tooltip" style={tipStyle}>
          {content}
        </div>,
        document.body,
      )}
    </>
  );
}
