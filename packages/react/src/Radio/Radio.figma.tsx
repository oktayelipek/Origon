import figma from '@figma/code-connect';
import { Radio } from './Radio';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Radio,
  'https://OriginUI/?node-id=12-54256',
  {
    props: {
      size: figma.enum('Size', {
        Small: 'small',
        Medium: 'medium',
        Large: 'large',
      }),
    },
    example: ({ size }) => <Radio size={size} />,
  },
);
