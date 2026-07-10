import figma from '@figma/code-connect';
import { Keyboard } from './Keyboard';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Keyboard,
  'https://OriginUI/?node-id=12-58173',
  {
    props: {
      layout: figma.enum('Layout', {
        Numeric: 'numeric',
        Decimal: 'decimal',
      }),
    },
    example: ({ layout }) => <Keyboard layout={layout} />,
  },
);
