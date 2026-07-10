import figma from '@figma/code-connect';
import { Button } from './Button';

// Figma component set {FKButton} — node 8:135
figma.connect(
  Button,
  'https://OriginUI/?node-id=8-135',
  {
    props: {
      size: figma.enum('Size', {
        Small: 'small',
        Medium: 'medium',
        Large: 'large',
      }),
      variant: figma.enum('Variant', {
        Primary: 'primary',
        Focus: 'focus',
        Outline: 'outline',
        Ghost: 'ghost',
      }),
      presence: figma.enum('Presence', {
        Default: 'default',
        Subtle: 'subtle',
      }),
      children: figma.textContent('Label'),
    },
    example: ({ size, variant, presence, children }) => (
      <Button size={size} variant={variant} presence={presence}>
        {children}
      </Button>
    ),
  },
);
