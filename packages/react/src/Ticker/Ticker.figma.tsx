import figma from '@figma/code-connect';
import { Ticker } from './Ticker';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  Ticker,
  'https://OriginUI/?node-id=12-3551',
  {
    props: {
      // TODO: add prop mappings — figma.enum / figma.textContent / figma.boolean
    },
    example: () => <Ticker />,
  },
);
