import figma from '@figma/code-connect';
import { Checkbox } from './Checkbox';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Checkbox,
  'https://OriginUI/?node-id=TODO' // FIXME: no node ID found in source,
  {
    props: {
      size: figma.enum('Size', {
        Small: 'small',
        Medium: 'medium',
        Large: 'large',
      }),
    },
    example: ({ size }) => <Checkbox size={size} />,
  },
);
