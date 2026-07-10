import figma from '@figma/code-connect';
import { InfoRow } from './InfoRow';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  InfoRow,
  'https://OriginUI/?node-id=12-73137',
  {
    props: {
      tone: figma.enum('Tone', {
        Info: 'info',
        Focus: 'focus',
        Caution: 'caution',
        Warning: 'warning',
      }),
      presence: figma.enum('Presence', {
        Low: 'low',
        High: 'high',
      }),
    },
    example: ({ tone, presence }) => <InfoRow tone={tone} presence={presence} />,
  },
);
