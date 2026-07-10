import figma from '@figma/code-connect';
import { Input } from './Input';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Input,
  'https://OriginUI/?node-id=12-68514',
  {
    props: {
      size: figma.enum('Size', {
        Large: 'large',
        Small: 'small',
        'X-small': 'x-small',
      }),
    },
    example: ({ size }) => <Input size={size} />,
  },
);
