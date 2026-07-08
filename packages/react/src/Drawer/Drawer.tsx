import React, { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { colors, semantic, radius, spacing } from '@origon/tokens-react';

export type DrawerSide = 'bottom' | 'right';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  children: ReactNode;
  /** Show the "grab handle" bar at the top (only meaningful when side="bottom"). */
  showHandle?: boolean;
  /** Optional accessible label for the drawer. */
  'aria-label'?: string;
}

/**
 * Drawer — bottom or right sheet with backdrop. Uses a portal into document.body.
 * Escape key + backdrop click both invoke onClose.
 */
export function Drawer({
  open,
  onClose,
  side = 'bottom',
  children,
  showHandle = true,
  'aria-label': ariaLabel,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Lock body scroll.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (typeof window === 'undefined') return null;
  if (!open) return null;

  const backdrop: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 999,
    animation: 'origonDrawerFade 160ms ease',
  };

  const panelBase: React.CSSProperties = {
    position: 'fixed',
    background: colors.blueGray[100],
    color: semantic.text.focus,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    animation: side === 'bottom'
      ? 'origonDrawerSlideUp 220ms cubic-bezier(0.2, 0.8, 0.2, 1)'
      : 'origonDrawerSlideLeft 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const panelStyle: React.CSSProperties = side === 'bottom'
    ? { ...panelBase, left: 0, right: 0, bottom: 0, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, maxHeight: '90vh' }
    : { ...panelBase, right: 0, top: 0, bottom: 0, width: 'min(400px, 100vw)', borderTopLeftRadius: radius.xxl, borderBottomLeftRadius: radius.xxl };

  return createPortal(
    <>
      <style>{`
        @keyframes origonDrawerFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes origonDrawerSlideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes origonDrawerSlideLeft { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
      <div style={backdrop} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={panelStyle}
      >
        {showHandle && side === 'bottom' && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xxs }}>
            <span
              aria-hidden
              style={{
                display: 'block',
                width: 40,
                height: 4,
                background: colors.blueGray[400],
                borderRadius: radius.xxl,
              }}
            />
          </div>
        )}
        <div style={{ overflow: 'auto', padding: spacing.md, flex: '1 1 auto' }}>{children}</div>
      </div>
    </>,
    document.body,
  );
}
