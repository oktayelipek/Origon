import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { colors, semantic, radius, spacing, text, font } from '@origon/tokens-react';

export interface DropdownOption<T = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Filterable combobox — shows a search input inside the popover. */
  combobox?: boolean;
  fullWidth?: boolean;
  'aria-label'?: string;
}

/**
 * Dropdown / Combo — a select control with an anchored popover list.
 * Set `combobox` to enable a search filter over the options.
 */
export function Dropdown<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  combobox = false,
  fullWidth = false,
  'aria-label': ariaLabel,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = combobox && query
    ? options.filter((o) => String(o.label).toLowerCase().includes(query.toLowerCase()))
    : options;

  // Sync activeIndex to the current selection when the popover opens.
  useEffect(() => {
    if (!open) { setActiveIndex(-1); return; }
    const initial = filtered.findIndex((o) => o.value === value && !o.disabled);
    setActiveIndex(initial >= 0 ? initial : filtered.findIndex((o) => !o.disabled));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Scroll active option into view.
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function moveActive(delta: number) {
    if (filtered.length === 0) return;
    let i = activeIndex;
    for (let step = 0; step < filtered.length; step++) {
      i = (i + delta + filtered.length) % filtered.length;
      if (!filtered[i].disabled) { setActiveIndex(i); return; }
    }
  }
  function firstActive() {
    const i = filtered.findIndex((o) => !o.disabled);
    if (i >= 0) setActiveIndex(i);
  }
  function lastActive() {
    for (let i = filtered.length - 1; i >= 0; i--) if (!filtered[i].disabled) { setActiveIndex(i); return; }
  }
  function commitActive() {
    const opt = filtered[activeIndex];
    if (!opt || opt.disabled) return;
    onChange?.(opt.value);
    setOpen(false);
    setQuery('');
  }

  function onRootKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'Escape':    e.preventDefault(); setOpen(false); break;
      case 'ArrowDown': e.preventDefault(); moveActive(1); break;
      case 'ArrowUp':   e.preventDefault(); moveActive(-1); break;
      case 'Home':      e.preventDefault(); firstActive(); break;
      case 'End':       e.preventDefault(); lastActive(); break;
      case 'Enter':     e.preventDefault(); commitActive(); break;
    }
  }

  return (
    <div
      ref={rootRef}
      onKeyDown={onRootKeyDown}
      style={{
        position: 'relative',
        display: fullWidth ? 'block' : 'inline-block',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: font.family.primary,
      }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.xs,
          width: fullWidth ? '100%' : undefined,
          minWidth: 160,
          height: 44,
          padding: `0 ${spacing.md}px`,
          background: disabled ? colors.blueGray[100] : colors.blueGray[200],
          color: disabled ? semantic.text.disable : selected ? semantic.text.focus : semantic.text.secondary,
          border: 'none',
          borderRadius: radius.sm,
          fontFamily: 'inherit',
          fontSize: text.md.fontSize,
          lineHeight: `${text.md.lineHeight}px`,
          fontWeight: font.weight.regular,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden style={{ color: semantic.text.secondary }}>
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          ref={listRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: fullWidth ? 0 : undefined,
            minWidth: '100%',
            marginTop: 4,
            background: colors.blueGray[200],
            border: `1px solid ${colors.blueGray[400]}`,
            borderRadius: radius.sm,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 10,
            maxHeight: 240,
            overflow: 'auto',
          }}
        >
          {combobox && (
            <input
              autoFocus
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                padding: `${spacing.xs}px ${spacing.md}px`,
                background: 'transparent',
                color: semantic.text.focus,
                border: 'none',
                borderBottom: `1px solid ${colors.blueGray[400]}`,
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: text.sm.fontSize,
              }}
            />
          )}
          {filtered.length === 0 && (
            <div style={{ padding: `${spacing.sm}px ${spacing.md}px`, color: semantic.text.secondary, fontSize: text.sm.fontSize }}>
              No results
            </div>
          )}
          {filtered.map((opt, i) => (
            <div
              key={String(opt.value)}
              role="option"
              data-index={i}
              aria-selected={opt.value === value}
              onClick={() => {
                if (opt.disabled) return;
                onChange?.(opt.value);
                setOpen(false);
                setQuery('');
              }}
              onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
              style={{
                padding: `${spacing.sm}px ${spacing.md}px`,
                color: opt.disabled ? semantic.text.disable : semantic.text.focus,
                background: opt.value === value
                  ? colors.blueGray[400]
                  : i === activeIndex ? colors.blueGray[300] : 'transparent',
                cursor: opt.disabled ? 'not-allowed' : 'pointer',
                fontSize: text.sm.fontSize,
                lineHeight: `${text.sm.lineHeight}px`,
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
