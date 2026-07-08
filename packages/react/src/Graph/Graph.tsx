import React, { useMemo } from 'react';
import { colors, semantic, text, font } from '@origon/tokens-react';

export interface GraphProps extends React.SVGAttributes<SVGSVGElement> {
  /** Series of numeric values (price ticks). */
  data: number[];
  width?: number;
  height?: number;
  /** Direction color override. When omitted, positive last→first uses green, negative red. */
  color?: string;
  showFill?: boolean;
}

/**
 * Graph — compact sparkline for row/card contexts.
 * Source: Figma `- Graph` (`12:84746`). Distinct from Charts: no axes, no
 * grid, single series, sized for inline placement (typically 96×32 or 120×40).
 */
export function Graph({
  data,
  width = 120,
  height = 40,
  color,
  showFill = true,
  style,
  ...rest
}: GraphProps) {
  const derived = useMemo(() => {
    if (data.length < 2) return null;
    let lo = Infinity, hi = -Infinity;
    for (const v of data) { if (v < lo) lo = v; if (v > hi) hi = v; }
    if (lo === hi) { lo -= 1; hi += 1; }
    const x = (i: number) => (i / (data.length - 1)) * width;
    const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
    const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
    const area = `${line} L${x(data.length - 1)},${height} L${x(0)},${height} Z`;
    const trend = data[data.length - 1] - data[0];
    return { line, area, trend };
  }, [data, width, height]);

  if (!derived) return null;

  const strokeColor = color ?? (derived.trend >= 0 ? colors.green[600] : colors.red[600]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'inline-block', ...style }}
      aria-hidden
      {...rest}
    >
      {showFill && <path d={derived.area} fill={strokeColor} opacity={0.16} />}
      <path d={derived.line} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
