import React, { type SVGAttributes } from 'react';
import { LOGO_COMPONENT_MAP, type LogoName } from './generated';

/**
 * BrandLogo — theme-aware wrapper. When a logo exists in both Dark and Light
 * variants (e.g., `paparaDark` + `paparaLight`), this picks the right one
 * from the DOM's `data-theme` attribute (set by `applyTheme()`).
 *
 * If only a single variant exists (e.g., `bitcoinLogo`), it renders that.
 * If nothing matches, renders null.
 */
export interface BrandLogoProps extends SVGAttributes<SVGSVGElement> {
  /**
   * Base brand name — lowercase, e.g. "papara", "garanti", "bitcoin".
   * The wrapper looks up `{base}Dark`, `{base}Light`, or the bare `{base}`.
   */
  name: string;
  height?: number;
  /** Force a specific theme instead of reading from data-theme. */
  themeOverride?: 'dark' | 'light';
}

export function BrandLogo({ name, height = 24, themeOverride, ...rest }: BrandLogoProps) {
  const [themeAttr, setThemeAttr] = React.useState<'dark' | 'light'>(themeOverride ?? 'dark');

  React.useEffect(() => {
    if (themeOverride || typeof document === 'undefined') return;
    const read = () => {
      const attr = document.documentElement.getAttribute('data-theme');
      setThemeAttr(attr === 'light' ? 'light' : 'dark');
    };
    read();
    // Watch for theme-switcher changes.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [themeOverride]);

  const key = pickLogoKey(name, themeAttr);
  if (!key) return null;
  const LogoComp = LOGO_COMPONENT_MAP[key];
  return <LogoComp height={height} {...rest} />;
}

function pickLogoKey(base: string, theme: 'dark' | 'light'): LogoName | null {
  const lower = base.toLowerCase();
  const themed = `${lower}${theme.charAt(0).toUpperCase() + theme.slice(1)}` as LogoName;
  if (themed in LOGO_COMPONENT_MAP) return themed;
  const other = `${lower}${theme === 'dark' ? 'Light' : 'Dark'}` as LogoName;
  if (other in LOGO_COMPONENT_MAP) return other;
  const bare = lower as LogoName;
  if (bare in LOGO_COMPONENT_MAP) return bare;
  const withLogo = `${lower}Logo` as LogoName;
  if (withLogo in LOGO_COMPONENT_MAP) return withLogo;
  return null;
}
