import React from 'react';
import type { DocsThemeConfig } from 'nextra-theme-docs';
import { ThemeSwitcher } from './components/ThemeSwitcher';

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700 }}>Origon UI</span>,
  navbar: {
    extraContent: <ThemeSwitcher />,
  },
  project: {
    link: 'https://github.com/btcturk/origon-ui',
  },
  docsRepositoryBase: 'https://github.com/btcturk/origon-ui/tree/main/apps/docs',
  footer: {
    content: 'Origon UI — © BtcTurk',
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Origon UI" />
      <meta
        property="og:description"
        content="Cross-platform design system for BtcTurk products (React, Flutter, SwiftUI)."
      />
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 2,
  },
  search: {
    placeholder: 'Search docs…',
  },
};

export default config;
