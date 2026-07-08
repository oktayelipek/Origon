import React, { useRef, useState, useEffect, useCallback, type CSSProperties } from 'react';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export type RangeSliderValue = number | [number, number];

export interface RangeSliderProps {
  value: RangeSliderValue;
  onChange: (value: RangeSliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showLabels?: boolean;
  formatValue?: (v: number) => string;
  label?: string;
}

/**
 * RangeSlider — single or dual-thumb slider. Pass `value={n}` for single,
 * `value={[a, b]}` for dual. Source: Figma `- Range Selector` (12:54109).
 */
export function RangeSlider({
  value, onChange, min = 0, max = 100, step = 1, disabled = false,
  showLabels = false, formatValue = (v) => String(Math.round(v)), label,
}: RangeSliderProps) {
  const isDual = Array.isArray(value);
  const [dragging, setDragging] = useState<null | 'low' | 'high' | 'single'>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const low = isDual ? (value as [number, number])[0] : min;
  const high = isDual ? (value as [number, number])[1] : (value as number);

  const primary = semantic.button?.primary ?? colors.blue[600];

  const clamp = (v: number) => Math.max(min, Math.min(max, Math.round(v / step) * step));

  const positionFromClient = useCallback((clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return low;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return clamp(min + ratio * (max - min));
  }, [min, max, step, low]);

  const onPointerDown = (which: 'low' | 'high' | 'single') => (e: React.PointerEvent) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(which);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || disabled) return;
    const v = positionFromClient(e.clientX);
    if (dragging === 'single') { onChange(v); return; }
    if (dragging === 'low') onChange([Math.min(v, high - step), high]);
    else onChange([low, Math.max(v, low + step)]);
  };
  const onPointerUp = () => setDragging(null);

  // Keyboard support — ArrowLeft/Right/Up/Down for step, Home/End for min/max,
  // PageUp/Down for 10× step.
  const onKeyDown = (which: 'low' | 'high' | 'single') => (e: React.KeyboardEvent) => {
    if (disabled) return;
    const stepBig = step * 10;
    const applyDelta = (delta: number) => {
      if (which === 'single') { onChange(clamp((high as number) + delta)); return; }
      if (which === 'low')  onChange([clamp(Math.min(low + delta,  high - step)), high]);
      else                  onChange([low, clamp(Math.max(high + delta, low + step))]);
    };
    const applyAbsolute = (target: number) => {
      if (which === 'single') { onChange(clamp(target)); return; }
      if (which === 'low')  onChange([clamp(Math.min(target, high - step)), high]);
      else                  onChange([low, clamp(Math.max(target, low + step))]);
    };
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown': e.preventDefault(); applyDelta(-step); break;
      case 'ArrowRight':
      case 'ArrowUp':   e.preventDefault(); applyDelta(+step); break;
      case 'PageDown':  e.preventDefault(); applyDelta(-stepBig); break;
      case 'PageUp':    e.preventDefault(); applyDelta(+stepBig); break;
      case 'Home':      e.preventDefault(); applyAbsolute(min); break;
      case 'End':       e.preventDefault(); applyAbsolute(max); break;
    }
  };

  const onTrackClick = (e: React.PointerEvent) => {
    if (disabled) return;
    const v = positionFromClient(e.clientX);
    if (!isDual) { onChange(v); return; }
    // Move whichever thumb is closer.
    if (Math.abs(v - low) <= Math.abs(v - high)) onChange([v, high]);
    else onChange([low, v]);
  };

  const pct = (v: number) => `${((v - min) / (max - min)) * 100}%`;

  const trackStyle: CSSProperties = {
    position: 'relative',
    height: 6,
    background: colors.blueGray[300],
    borderRadius: 3,
    touchAction: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
  const fillStyle: CSSProperties = {
    position: 'absolute',
    top: 0, bottom: 0,
    left: pct(low),
    right: `calc(100% - ${pct(high)})`,
    background: disabled ? colors.blueGray[500] : primary,
    borderRadius: 3,
  };
  const thumbStyle = (v: number, kind: 'low' | 'high' | 'single'): CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: pct(v),
    transform: 'translate(-50%, -50%)',
    width: 18, height: 18, borderRadius: 18,
    background: colors.base.white,
    border: `2px solid ${disabled ? colors.blueGray[500] : primary}`,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    cursor: disabled ? 'not-allowed' : 'grab',
    touchAction: 'none',
    zIndex: 2,
  });

  return (
    <div style={{ fontFamily: font.family.primary }}>
      {label && <div style={{ fontSize: text.xs.fontSize, color: semantic.text.secondary, fontWeight: font.weight.medium, marginBottom: spacing.xs }}>{label}</div>}
      <div
        ref={trackRef}
        role="group"
        aria-label={label}
        style={{ paddingTop: 10, paddingBottom: 10 }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div style={trackStyle} onPointerDown={onTrackClick}>
          <div style={fillStyle} />
          {isDual ? (
            <>
              <div
                role="slider"
                aria-valuemin={min} aria-valuemax={max} aria-valuenow={low} aria-valuetext={formatValue(low)}
                tabIndex={disabled ? -1 : 0}
                style={thumbStyle(low, 'low')}
                onPointerDown={onPointerDown('low')}
                onKeyDown={onKeyDown('low')}
              />
              <div
                role="slider"
                aria-valuemin={min} aria-valuemax={max} aria-valuenow={high} aria-valuetext={formatValue(high)}
                tabIndex={disabled ? -1 : 0}
                style={thumbStyle(high, 'high')}
                onPointerDown={onPointerDown('high')}
                onKeyDown={onKeyDown('high')}
              />
            </>
          ) : (
            <div
              role="slider"
              aria-valuemin={min} aria-valuemax={max} aria-valuenow={high} aria-valuetext={formatValue(high)}
              tabIndex={disabled ? -1 : 0}
              style={thumbStyle(high, 'single')}
              onPointerDown={onPointerDown('single')}
              onKeyDown={onKeyDown('single')}
            />
          )}
        </div>
      </div>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: text.xs.fontSize, color: semantic.text.secondary }}>
          {isDual ? <><span>{formatValue(low)}</span><span>{formatValue(high)}</span></> : <><span>{formatValue(min)}</span><span>{formatValue(high)}</span><span>{formatValue(max)}</span></>}
        </div>
      )}
    </div>
  );
}
