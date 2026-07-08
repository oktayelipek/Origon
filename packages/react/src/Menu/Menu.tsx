import React, { useState, useRef, useEffect, useLayoutEffect, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export interface MenuItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Renders as a destructive item (red text). */
  danger?: boolean;
  /** Divider before this item. */
  divider?: boolean;
}

export interface MenuProps {
  /** The trigger element. Clicking it toggles the menu. */
  trigger: React.ReactElement;
  items: MenuItem[];
  onSelect?: (value: string) => void;
  /** Preferred placement relative to the trigger. */
  side?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  'aria-label'?: string;
}

/**
 * Menu — anchored action list. Source: Figma `- Menu` (12:55798).
 * Portalizes to document.body so it escapes overflow: hidden ancestors.
 */
export function Menu({ trigger, items, onSelect, side = 'bottom-start', 'aria-label': ariaLabel }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const m = menuRef.current.getBoundingClientRect();
    const gap = 4;
    let top = 0, left = 0;
    switch (side) {
      case 'bottom-start': top = t.bottom + gap; left = t.left; break;
      case 'bottom-end':   top = t.bottom + gap; left = t.right - m.width; break;
      case 'top-start':    top = t.top - m.height - gap; left = t.left; break;
      case 'top-end':      top = t.top - m.height - gap; left = t.right - m.width; break;
    }
    // Clamp to viewport.
    top = Math.max(4, Math.min(window.innerHeight - m.height - 4, top));
    left = Math.max(4, Math.min(window.innerWidth - m.width - 4, left));
    setPos({ position: 'fixed', top, left });
  }, [open, side]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const clonedTrigger = React.cloneElement(trigger as React.ReactElement<any>, {
    ref: (n: HTMLElement | null) => {
      triggerRef.current = n;
      const { ref } = trigger as any;
      if (typeof ref === 'function') ref(n);
      else if (ref) ref.current = n;
    },
    onClick: (e: React.MouseEvent) => {
      setOpen((o) => !o);
      (trigger.props as any).onClick?.(e);
    },
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  });

  return (
    <>
      {clonedTrigger}
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          style={{
            ...pos,
            minWidth: 200,
            background: colors.blueGray[200],
            border: `1px solid ${colors.blueGray[400]}`,
            borderRadius: radius.sm,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 2000,
            padding: `${spacing.xxs}px 0`,
            fontFamily: font.family.primary,
          }}
        >
          {items.map((item, i) => (
            <React.Fragment key={item.value}>
              {item.divider && i > 0 && <hr style={{ margin: `${spacing.xxs}px 0`, border: 'none', borderTop: `1px solid ${colors.blueGray[400]}` }} />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  onSelect?.(item.value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  width: '100%',
                  padding: `${spacing.xs}px ${spacing.md}px`,
                  background: 'transparent',
                  border: 'none',
                  color: item.disabled
                    ? semantic.text.disable
                    : item.danger ? colors.red[500] : semantic.text.focus,
                  fontFamily: 'inherit',
                  fontSize: text.sm.fontSize,
                  fontWeight: font.weight.regular,
                  textAlign: 'left',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!item.disabled) (e.currentTarget as HTMLElement).style.background = colors.blueGray[300]; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {item.icon && <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{item.icon}</span>}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
