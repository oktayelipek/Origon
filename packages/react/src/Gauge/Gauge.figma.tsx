import figma from '@figma/code-connect';
import { Gauge } from './Gauge';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Gauge,
  'https://OriginUI/?node-id=12-84862',
  {
    props: {
      tone: figma.enum('Tone', {
        Neutral: 'neutral',
        Success: 'success',
        Warning: 'warning',
        Danger: 'danger',
        Brand: 'brand',
      }),
    },
    example: ({ tone }) => <Gauge tone={tone} />,
  },
);
