import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  message: ReactNode;
  title?: ReactNode;
  tone?: ToastTone;
  duration?: number;    // ms; 0 = sticky (no auto-dismiss)
  action?: { label: ReactNode; onClick: () => void };
  icon?: ReactNode;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Wrap your app once at the root:
 *
 *     <ToastProvider>
 *       <App />
 *     </ToastProvider>
 *
 * Then call from anywhere:
 *
 *     const { toast } = useToast();
 *     toast({ message: 'Order placed', tone: 'success' });
 *
 * Source: Figma `{FK-Toast-Row}` / `{FK-Toast-Centered}` (12:3039).
 */
export function ToastProvider({ children, placement = 'bottom-right' }: { children: ReactNode; placement?: 'top' | 'top-right' | 'bottom-right' | 'bottom' }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((all) => all.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: ToastOptions) => {
    const id = nextId.current++;
    const item: ToastItem = { duration: 4000, tone: 'info', ...opts, id };
    setItems((all) => [...all, item]);
    if (item.duration && item.duration > 0) {
      window.setTimeout(() => dismiss(id), item.duration);
    }
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <ToastRegion items={items} placement={placement} onDismiss={dismiss} />,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

function ToastRegion({ items, placement, onDismiss }: { items: ToastItem[]; placement: string; onDismiss: (id: number) => void }) {
  const regionStyle: CSSProperties = {
    position: 'fixed',
    zIndex: 2100,
    display: 'flex',
    flexDirection: placement.startsWith('bottom') ? 'column-reverse' : 'column',
    gap: spacing.sm,
    padding: spacing.md,
    pointerEvents: 'none',
  };
  if (placement === 'top-right' || placement === 'bottom-right') Object.assign(regionStyle, { right: 0, top: placement === 'top-right' ? 0 : undefined, bottom: placement === 'bottom-right' ? 0 : undefined });
  else if (placement === 'top') Object.assign(regionStyle, { top: 0, left: '50%', transform: 'translateX(-50%)' });
  else Object.assign(regionStyle, { bottom: 0, left: '50%', transform: 'translateX(-50%)' });

  return (
    <div style={regionStyle} role="region" aria-label="Notifications">
      {items.map((t) => <ToastCard key={t.id} item={t} onDismiss={() => onDismiss(t.id)} />)}
    </div>
  );
}

const TONE_STYLE: Record<ToastTone, { bg: string; fg: string; border: string; accent: string }> = {
  info:    { bg: colors.blueGray[200], fg: semantic.text.focus, border: colors.blueGray[400], accent: semantic.button?.primary ?? colors.blue[600] },
  success: { bg: colors.blueGray[200], fg: semantic.text.focus, border: colors.green[600],    accent: colors.green[600] },
  warning: { bg: colors.blueGray[200], fg: semantic.text.focus, border: colors.amber[500],    accent: colors.amber[500] },
  danger:  { bg: colors.blueGray[200], fg: semantic.text.focus, border: colors.red[600],      accent: colors.red[600] },
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setEntering(false), 20);
    return () => window.clearTimeout(t);
  }, []);
  const tone = TONE_STYLE[item.tone ?? 'info'];
  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        minWidth: 300,
        maxWidth: 420,
        padding: `${spacing.sm}px ${spacing.md}px`,
        background: tone.bg,
        color: tone.fg,
        borderRadius: radius.sm,
        borderLeft: `3px solid ${tone.accent}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing.sm,
        fontFamily: font.family.primary,
        transform: entering ? 'translateY(8px)' : 'translateY(0)',
        opacity: entering ? 0 : 1,
        transition: 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 220ms ease',
      }}
    >
      {item.icon && <span aria-hidden style={{ color: tone.accent, flex: '0 0 auto', display: 'inline-flex', width: 20, height: 20 }}>{item.icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.title && <div style={{ fontSize: text.sm.fontSize, fontWeight: font.weight.medium, marginBottom: 2 }}>{item.title}</div>}
        <div style={{ fontSize: text.sm.fontSize, opacity: 0.9 }}>{item.message}</div>
      </div>
      {item.action && (
        <button
          type="button"
          onClick={() => { item.action!.onClick(); onDismiss(); }}
          style={{ background: 'transparent', border: 'none', color: tone.accent, fontFamily: 'inherit', fontSize: text.sm.fontSize, fontWeight: font.weight.medium, cursor: 'pointer', padding: 0, flex: '0 0 auto' }}
        >
          {item.action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        style={{ background: 'transparent', border: 'none', color: semantic.text.secondary, cursor: 'pointer', padding: 0, marginLeft: 4, flex: '0 0 auto' }}
      >
        <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
