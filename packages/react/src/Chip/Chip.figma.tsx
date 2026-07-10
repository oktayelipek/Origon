import figma from '@figma/code-connect';
import { Chip } from './Chip';

// Figma Chip component set — node 12:86248
figma.connect(
  Chip,
  'https://OriginUI/?node-id=12-86248',
  {
    props: {
      size: figma.enum('Size', {
        XS: 'xs',
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
      }),
      variant: figma.enum('Variant', {
        Line: 'line',
        Solid: 'solid',
      }),
      selected: figma.enum('State', {
        Selected: true,
        Default: false,
      }),
      children: figma.textContent('Label'),
    },
    example: ({ size, variant, selected, children }) => (
      <Chip size={size} variant={variant} selected={selected}>
        {children}
      </Chip>
    ),
  },
);
