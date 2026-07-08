import React from 'react';
import type { Preview } from '@storybook/react';
import '@origon/tokens-react/css';
import '@origon/tokens-react/themes/css';
import { applyTheme, type Brand, type Theme } from '@origon/tokens-react/themes';

const brands: Brand[] = ['kripto', 'hisse', 'global'];
const themes: Theme[] = ['dark', 'light'];

const preview: Preview = {
  globalTypes: {
    brand: {
      name: 'Brand',
      description: 'Origon UI brand',
      defaultValue: 'kripto',
      toolbar: {
        icon: 'paintbrush',
        items: brands.map((b) => ({ value: b, title: b.charAt(0).toUpperCase() + b.slice(1) })),
        showName: true,
        dynamicTitle: true,
      },
    },
    theme: {
      name: 'Theme',
      description: 'Light / Dark',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: themes.map((t) => ({ value: t, title: t.charAt(0).toUpperCase() + t.slice(1) })),
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'basement',
      values: [
        { name: 'basement', value: '#070910' },
        { name: 'surface',  value: '#0b0f1a' },
        { name: 'elevation', value: '#131f2f' },
      ],
    },
    layout: 'centered',
  },
  decorators: [
    (Story, ctx) => {
      const b = ctx.globals.brand as Brand;
      const t = ctx.globals.theme as Theme;
      React.useEffect(() => { applyTheme(b, t); }, [b, t]);
      return (
        <div
          data-brand={b}
          data-theme={t}
          style={{
            fontFamily: 'Inter Variable, Inter, system-ui, sans-serif',
            color: 'var(--semantic-text-focus, #f0f4f7)',
            padding: 24,
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
