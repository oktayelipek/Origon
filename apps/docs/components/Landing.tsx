import React from 'react';
import Link from 'next/link';
import { Button, Chip, Bullet, Loader, Toggle, Gauge, Graph, BrandLogo, Icon } from '@origon/react';

const container: React.CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  padding: '32px 24px 64px',
  fontFamily: 'inherit',
};

const surface = 'var(--semantic-level-basement, #0b0f1a)';
const elevation = 'var(--semantic-level-elevation, #131f2f)';
const border = 'var(--semantic-border-level-2, #131f2f)';
const textFocus = 'var(--semantic-text-focus, #f0f4f7)';
const textSecondary = 'var(--semantic-text-secondary, #858fa6)';
const brand = 'var(--semantic-button-primary, #005fae)';

export function Hero() {
  return (
    <div style={{ ...container, paddingTop: 24 }}>
      <div
        style={{
          position: 'relative',
          padding: '48px 40px',
          borderRadius: 24,
          background: `linear-gradient(135deg, ${brand}22 0%, ${elevation} 60%, ${surface} 100%)`,
          border: `1px solid ${border}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: 200, background: brand, filter: 'blur(80px)', opacity: 0.25 }} aria-hidden />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ padding: '4px 10px', borderRadius: 999, background: elevation, border: `1px solid ${border}`, fontSize: 11, color: textSecondary, fontWeight: 500 }}>
            v3 · 33 components · 3 platforms
          </span>
          <span style={{ padding: '4px 10px', borderRadius: 999, background: elevation, border: `1px solid ${border}`, fontSize: 11, color: textSecondary, fontWeight: 500 }}>
            6 modes · Kripto · Hisse · Global
          </span>
        </div>
        <h1 style={{ fontSize: 56, lineHeight: 1.05, fontWeight: 700, letterSpacing: -1.5, margin: 0, color: textFocus, maxWidth: 720 }}>
          The design system behind <span style={{ color: brand }}>BtcTurk</span> crypto & stocks.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.5, color: textSecondary, marginTop: 20, maxWidth: 640 }}>
          One Figma source of truth, three production libraries: React, Flutter,
          SwiftUI. Runtime theme switching across 6 brand × theme modes.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <Link href="/components/button" style={{ textDecoration: 'none' }}>
            <Button size="large">Browse components</Button>
          </Link>
          <Link href="/foundations/theming" style={{ textDecoration: 'none' }}>
            <Button size="large" variant="outline">Try theme switcher</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const featureCards = [
  { icon: '🎨', title: '527 tokens', body: '10-step color scales, semantic aliases, spacing, radius, shadow, typography — all Figma-synced.', href: '/foundations/colors' },
  { icon: '🌗', title: '6 brand × theme modes', body: 'Kripto / Hisse / Global × Dark / Light. Runtime switching via ThemeProvider (React, Flutter, SwiftUI).', href: '/foundations/theming' },
  { icon: '🧩', title: '33 components', body: 'From Button to Table. Live previews, cross-platform code tabs, keyboard nav + a11y.', href: '/components/button' },
  { icon: '⭐', title: '598 icons + 236 logos', body: 'Auto-exported from Figma. currentColor icons for tinting, multi-color logos for brands.', href: '/components/icons' },
  { icon: '📱', title: '3 platforms, one API', body: 'React canonical → Flutter (widgetbook) → SwiftUI. Prop names, sizes, defaults identical.', href: '/foundations/theming' },
  { icon: '✅', title: '96 unit tests', body: 'Vitest + RTL for React; flutter_test + XCTest for native. CI runs all on every push.', href: '/foundations/colors' },
];

export function Features() {
  return (
    <div style={container}>
      <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, color: textFocus, margin: 0, marginBottom: 24 }}>
        What's in the box
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {featureCards.map((f) => (
          <Link key={f.title} href={f.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: 20,
                borderRadius: 16,
                background: elevation,
                border: `1px solid ${border}`,
                height: '100%',
                transition: 'transform 160ms ease, border-color 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = brand; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = border; }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }} aria-hidden>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: textFocus, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: textSecondary, lineHeight: 1.5 }}>{f.body}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Preview() {
  const priceData = [10, 12, 11, 15, 14, 18, 20, 22, 21, 24, 26];
  return (
    <div style={container}>
      <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, color: textFocus, margin: 0, marginBottom: 8 }}>
        Real components, live
      </h2>
      <p style={{ color: textSecondary, marginTop: 0, marginBottom: 24, fontSize: 15 }}>
        Everything below is a real Origon component. Change the brand or theme in the top bar — the entire grid recolors.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <PreviewCard label="Buttons">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="small">Primary</Button>
            <Button size="small" variant="outline">Outline</Button>
            <Button size="small" variant="ghost">Ghost</Button>
          </div>
        </PreviewCard>
        <PreviewCard label="Bullet + Chips">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bullet variant="line" count={3} active={1} />
            <div style={{ display: 'flex', gap: 6 }}>
              <Chip size="xs" selected onSelect={() => {}}>1D</Chip>
              <Chip size="xs" selected={false} onSelect={() => {}}>1W</Chip>
              <Chip size="xs" selected={false} onSelect={() => {}}>1M</Chip>
            </div>
          </div>
        </PreviewCard>
        <PreviewCard label="Gauge + Loader">
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Gauge value={75} tone="brand" size={56} />
            <Loader size="medium" />
          </div>
        </PreviewCard>
        <PreviewCard label="Graph">
          <Graph data={priceData} width={220} height={60} />
        </PreviewCard>
        <PreviewCard label="Icons">
          <div style={{ display: 'flex', gap: 12, color: textFocus }}>
            <Icon name="check" size={22} />
            <Icon name="star" size={22} />
            <Icon name="search" size={22} />
            <Icon name="alert" size={22} />
            <Icon name="info" size={22} />
          </div>
        </PreviewCard>
        <PreviewCard label="Toggle + BrandLogo">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Toggle checked size="medium" />
            <BrandLogo name="bitcoin" height={22} />
          </div>
        </PreviewCard>
      </div>
    </div>
  );
}

function PreviewCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 20, borderRadius: 16, background: elevation, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 140 }}>
      <div style={{ fontSize: 11, color: textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{children}</div>
    </div>
  );
}

export function Stats() {
  const stats = [
    { n: '527', l: 'design tokens' },
    { n: '6', l: 'brand × theme modes' },
    { n: '33', l: 'components' },
    { n: '598', l: 'line icons' },
    { n: '236', l: 'brand logos' },
    { n: '96', l: 'unit tests' },
    { n: '3', l: 'platforms' },
    { n: '1', l: 'source of truth' },
  ];
  return (
    <div style={container}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        {stats.map((s) => (
          <div key={s.l} style={{ padding: 20, borderRadius: 16, background: elevation, border: `1px solid ${border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: textFocus, letterSpacing: -1 }}>{s.n}</div>
            <div style={{ fontSize: 12, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
