import figma from '@figma/code-connect';
import { Drawer } from './Drawer';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Drawer,
  'https://OriginUI/?node-id=TODO' // FIXME: no node ID found in source,
  {
    props: {
      side: figma.enum('Side', {
        Bottom: 'bottom',
        Right: 'right',
      }),
    },
    example: ({ side }) => <Drawer side={side} />,
  },
);
