import figma from '@figma/code-connect';
import { Chart } from './Chart';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Chart,
  'https://OriginUI/?node-id=12-86299',
  {
    props: {
      kind: figma.enum('Kind', {
        Line: 'line',
        Area: 'area',
        Bar: 'bar',
        Candlestick: 'candlestick',
      }),
    },
    example: ({ kind }) => <Chart kind={kind} />,
  },
);
