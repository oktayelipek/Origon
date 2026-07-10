import figma from '@figma/code-connect';
import { Bullet } from './Bullet';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Bullet,
  'https://OriginUI/?node-id=8-837',
  {
    props: {
      variant: figma.enum('Variant', {
        Line: 'line',
        Dots: 'dots',
      }),
    },
    example: ({ variant }) => <Bullet variant={variant} />,
  },
);
