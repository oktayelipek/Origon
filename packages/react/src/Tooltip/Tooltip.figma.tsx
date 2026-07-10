import figma from '@figma/code-connect';
import { Tooltip } from './Tooltip';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Tooltip,
  'https://OriginUI/?node-id=11-2720',
  {
    props: {
      side: figma.enum('Side', {
        Top: 'top',
        Bottom: 'bottom',
        Left: 'left',
        Right: 'right',
      }),
    },
    example: ({ side }) => <Tooltip side={side} />,
  },
);
