import figma from '@figma/code-connect';
import { Toggle } from './Toggle';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Toggle,
  'https://OriginUI/?node-id=12-3011',
  {
    props: {
      size: figma.enum('Size', {
        Small: 'small',
        Medium: 'medium',
        Large: 'large',
      }),
    },
    example: ({ size }) => <Toggle size={size} />,
  },
);
