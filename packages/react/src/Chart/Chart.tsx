import React, { useMemo, useState } from 'react';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export type ChartKind = 'line' | 'area' | 'bar' | 'candlestick';

export interface ChartSeries {
  label?: string;
  color?: string;
  /** For line/area/bar: numeric values. For candlestick: use `ohlc` instead. */
  data: number[];
}

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  /** Optional bucket label (e.g., "12:00"). */
  label?: string;
}

export interface ChartProps {
  kind?: ChartKind;
  /** Required for kind !== "candlestick". */
  series?: ChartSeries[];
  /** Required for kind === "candlestick". */
  ohlc?: Candle[];
  labels?: string[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showTooltip?: boolean;
  /** Custom tooltip formatter for series points. */
  formatValue?: (v: number, seriesIndex: number, i: number) => string;
}

/**
 * Chart — lightweight primitive covering line/area/bar/candlestick.
 * For heavier viz (brushing, log scales, multi-axis) integrate with a chart
 * library and pass Origon tokens via the chart's theming API.
 * Source: Figma `- Charts` (`12:86299`).
 */
export function Chart({
  kind = 'line',
  series,
  ohlc,
  labels,
  width = 320,
  height = 160,
  showGrid = true,
  showAxes = false,
  showTooltip = true,
  formatValue = (v) => Number.isFinite(v) ? v.toFixed(2) : String(v),
}: ChartProps) {
  const padding = { top: 12, right: 12, bottom: showAxes ? 20 : 8, left: showAxes ? 32 : 8 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const [hover, setHover] = useState<{ x: number; y: number; i: number } | null>(null);

  const domain = useMemo(() => {
    if (kind === 'candlestick') {
      const values = (ohlc ?? []).flatMap((c) => [c.high, c.low]);
      let lo = Math.min(...values), hi = Math.max(...values);
      if (lo === hi) { lo -= 1; hi += 1; }
      return { min: lo, max: hi, len: (ohlc ?? []).length };
    }
    let lo = Infinity, hi = -Infinity, l = 0;
    for (const s of series ?? []) {
      l = Math.max(l, s.data.length);
      for (const v of s.data) { if (v < lo) lo = v; if (v > hi) hi = v; }
    }
    if (lo === hi) { lo -= 1; hi += 1; }
    return { min: lo, max: hi, len: l };
  }, [kind, series, ohlc]);

  const x = (i: number) => padding.left + (i / Math.max(1, domain.len - 1)) * innerW;
  const y = (v: number) => padding.top + innerH - ((v - domain.min) / (domain.max - domain.min)) * innerH;

  const defaultColor = semantic.button?.primary ?? colors.blue[600];
  const upColor = colors.green[600];
  const downColor = colors.red[600];
  const gridColor = colors.blueGray[300];

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!showTooltip) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - padding.left;
    if (relX < 0 || relX > innerW) { setHover(null); return; }
    const i = Math.round((relX / innerW) * (domain.len - 1));
    if (i < 0 || i >= domain.len) { setHover(null); return; }
    setHover({ x: x(i), y: e.clientY - rect.top, i });
  }

  return (
    <div style={{ position: 'relative', width, height, fontFamily: font.family.primary }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {showGrid && (
          <g stroke={gridColor} strokeWidth={1} opacity={0.5}>
            {[0.25, 0.5, 0.75].map((f, i) => (
              <line key={i} x1={padding.left} x2={padding.left + innerW} y1={padding.top + f * innerH} y2={padding.top + f * innerH} />
            ))}
          </g>
        )}

        {kind === 'candlestick' && ohlc && (
          <g>
            {ohlc.map((c, i) => {
              const isUp = c.close >= c.open;
              const color = isUp ? upColor : downColor;
              const bodyTop = y(Math.max(c.open, c.close));
              const bodyBottom = y(Math.min(c.open, c.close));
              const wickX = x(i);
              const cellW = innerW / Math.max(1, ohlc.length);
              const bodyW = Math.max(1.5, cellW * 0.6);
              return (
                <g key={i}>
                  <line x1={wickX} x2={wickX} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1} />
                  <rect
                    x={wickX - bodyW / 2}
                    y={bodyTop}
                    width={bodyW}
                    height={Math.max(1, bodyBottom - bodyTop)}
                    fill={color}
                  />
                </g>
              );
            })}
          </g>
        )}

        {kind !== 'candlestick' && series && series.map((s, si) => {
          const color = s.color ?? defaultColor;
          if (kind === 'bar') {
            const barW = innerW / (s.data.length * series.length) * 0.7;
            return (
              <g key={si}>
                {s.data.map((v, i) => (
                  <rect
                    key={i}
                    x={x(i) - (barW * series.length) / 2 + si * barW}
                    y={y(Math.max(0, v))}
                    width={barW}
                    height={Math.abs(y(v) - y(0))}
                    fill={color}
                    rx={2}
                  />
                ))}
              </g>
            );
          }
          const path = s.data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
          const area = `${path} L${x(s.data.length - 1)},${padding.top + innerH} L${x(0)},${padding.top + innerH} Z`;
          return (
            <g key={si}>
              {kind === 'area' && <path d={area} fill={color} opacity={0.18} />}
              <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}

        {/* Hover crosshair + point markers */}
        {hover && showTooltip && (
          <g pointerEvents="none">
            <line x1={hover.x} x2={hover.x} y1={padding.top} y2={padding.top + innerH} stroke={colors.blueGray[500]} strokeWidth={1} strokeDasharray="3 3" />
            {kind !== 'candlestick' && series?.map((s, si) => {
              const v = s.data[hover.i];
              if (v === undefined) return null;
              const color = s.color ?? defaultColor;
              return <circle key={si} cx={hover.x} cy={y(v)} r={3.5} fill={color} stroke={colors.base.white} strokeWidth={1} />;
            })}
          </g>
        )}

        {showAxes && labels && (
          <g fill={semantic.text.secondary} style={{ fontSize: text.xxs.fontSize }}>
            {labels.map((l, i) => (
              <text key={i} x={x(i)} y={height - 4} textAnchor="middle">{l}</text>
            ))}
          </g>
        )}
      </svg>

      {hover && showTooltip && (
        <ChartTooltip
          left={hover.x}
          top={padding.top}
          containerWidth={width}
        >
          <div style={{ fontSize: text.xxs.fontSize, opacity: 0.7, marginBottom: 4 }}>
            {labels?.[hover.i] ?? `#${hover.i}`}
          </div>
          {kind === 'candlestick' && ohlc?.[hover.i] && (
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: 8, rowGap: 2, fontSize: text.xs.fontSize }}>
              <span style={{ opacity: 0.6 }}>O</span><span>{formatValue(ohlc[hover.i].open, 0, hover.i)}</span>
              <span style={{ opacity: 0.6 }}>H</span><span>{formatValue(ohlc[hover.i].high, 0, hover.i)}</span>
              <span style={{ opacity: 0.6 }}>L</span><span>{formatValue(ohlc[hover.i].low, 0, hover.i)}</span>
              <span style={{ opacity: 0.6 }}>C</span><span>{formatValue(ohlc[hover.i].close, 0, hover.i)}</span>
            </div>
          )}
          {kind !== 'candlestick' && series?.map((s, si) => (
            <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: text.xs.fontSize }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 8, background: s.color ?? defaultColor }} />
              <span style={{ opacity: 0.7 }}>{s.label ?? `Series ${si + 1}`}:</span>
              <span style={{ fontWeight: font.weight.medium }}>{formatValue(s.data[hover.i], si, hover.i)}</span>
            </div>
          ))}
        </ChartTooltip>
      )}
    </div>
  );
}

function ChartTooltip({ left, top, containerWidth, children }: { left: number; top: number; containerWidth: number; children: React.ReactNode }) {
  // Flip to the left if too close to right edge.
  const flipped = left > containerWidth - 120;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: flipped ? undefined : left + 8,
        right: flipped ? containerWidth - left + 8 : undefined,
        minWidth: 96,
        padding: `${spacing.xs}px ${spacing.sm}px`,
        background: colors.blueGray[100],
        border: `1px solid ${colors.blueGray[400]}`,
        borderRadius: 6,
        color: semantic.text.focus,
        pointerEvents: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        zIndex: 1,
      }}
    >
      {children}
    </div>
  );
}
