import React, { useEffect, useState } from 'react';
import { applyTheme, type Brand, type Theme } from '@origon/tokens-react/themes';

const BRANDS: Brand[] = ['kripto', 'hisse', 'global'];
const THEMES: Theme[] = ['dark', 'light'];
const STORAGE_KEY = 'origon-ui-theme';

/**
 * ThemeSwitcher — dropdowns + light/dark toggle wired to applyTheme().
 * Persists selection to localStorage; falls back to Kripto Dark.
 */
export function ThemeSwitcher() {
  const [brand, setBrand] = useState<Brand>('kripto');
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { brand?: Brand; theme?: Theme };
        if (parsed.brand && BRANDS.includes(parsed.brand)) setBrand(parsed.brand);
        if (parsed.theme && THEMES.includes(parsed.theme)) setTheme(parsed.theme);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(brand, theme);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand, theme }));
    } catch {}
  }, [brand, theme, mounted]);

  if (!mounted) return null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ opacity: 0.7 }}>Brand</span>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value as Brand)}
          style={selectStyle}
        >
          {BRANDS.map((b) => (
            <option key={b} value={b}>{titleCase(b)}</option>
          ))}
        </select>
      </label>
      <div style={{ display: 'inline-flex', border: '1px solid var(--nextra-primary-hue, #666)', borderRadius: 4, overflow: 'hidden' }}>
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            style={{
              background: theme === t ? 'var(--semantic-button-primary, #005fae)' : 'transparent',
              color: theme === t ? '#fff' : 'inherit',
              border: 'none',
              padding: '4px 10px',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 12,
  fontFamily: 'inherit',
  background: 'transparent',
  color: 'inherit',
  border: '1px solid var(--nextra-primary-hue, #666)',
  borderRadius: 4,
  cursor: 'pointer',
};

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
