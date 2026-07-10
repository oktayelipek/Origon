import figma from '@figma/code-connect';
import { Loader } from './Loader';

// Figma component set FK-Loader — node 12:58010
figma.connect(
  Loader,
  'https://OriginUI/?node-id=12-58010',
  {
    props: {
      size: figma.enum('Size', {
        'XX-Small': 'xx-small',
        Small: 'small',
        Medium: 'medium',
        Large: 'large',
      }),
    },
    example: ({ size }) => <Loader size={size} />,
  },
);
