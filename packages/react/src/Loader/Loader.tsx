import React, { forwardRef, type CSSProperties } from 'react';
import { semantic } from '@origon/tokens-react';

export type LoaderSize = 'xx-small' | 'small' | 'medium' | 'large';

export interface LoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: LoaderSize;
  /** Accessible label announced to screen readers. Defaults to "Loading". */
  label?: string;
}

// Sizes from Figma component set FK-Loader (node 12:58010). All variants share
// the same shape at different scales; the SVG viewBox is 24×33 (Small).
const SIZE_SPECS: Record<LoaderSize, { width: number; height: number }> = {
  large:      { width: 44, height: 60 },
  medium:     { width: 32, height: 44 },
  small:      { width: 24, height: 33 },
  'xx-small': { width: 8,  height: 11 },
};

// 12 petal paths — extracted from Figma component 12:58020 (Animate/Default frame).
// Same paths reused across all 8 Figma "animate" frames; only opacity varies.
const PETALS: string[] = [
  'M15.7507 28.8498C13.9117 30.2131 12.8125 31.9063 13.3198 32.6539C13.8271 33.4016 15.7296 32.8958 17.5686 31.5325C19.4077 30.1692 20.5069 28.476 19.9995 27.7284C19.8516 27.4865 19.5556 27.3985 19.154 27.3985C18.3085 27.3765 17.019 27.9043 15.7507 28.8498Z',
  'M5.60459 25.9473C2.03219 27.4865 -0.441014 29.7734 0.0663095 31.0708C0.573633 32.3681 3.89237 32.1702 7.46477 30.653C11.0372 29.1137 13.5104 26.8269 13.0031 25.5295C12.7705 24.9578 11.9884 24.6719 10.8681 24.6719C9.47293 24.6499 7.57047 25.0897 5.60459 25.9473Z',
  'M21.9657 24.408C21.3316 25.6614 21.1413 26.8489 21.5218 27.0468C21.9023 27.2666 22.7267 26.4091 23.3608 25.1556C23.9949 23.9022 24.1852 22.7148 23.8047 22.5169C23.7202 22.4729 23.6146 22.4509 23.4877 22.4509C22.8536 22.4949 22.4308 23.4844 21.9657 24.408Z',
  'M16.8079 20.9337C15.5818 21.6593 14.9477 22.8907 15.3705 23.6823C15.8144 24.474 17.1673 24.518 18.3934 23.7924C19.6194 23.0668 20.2535 21.8354 19.8307 21.0437C19.6194 20.6479 19.1543 20.428 18.5836 20.428C17.9918 20.406 17.3577 20.5819 16.8079 20.9337Z',
  'M21.3316 19.2625C20.9722 19.9002 20.9934 20.6038 21.395 20.8457C21.7755 21.0876 22.4096 20.7358 22.769 20.098C23.1284 19.4603 23.1072 18.7567 22.7056 18.5148C22.6212 18.4708 22.5155 18.4488 22.4308 18.4488C22.0714 18.4708 21.6698 18.7127 21.3316 19.2625Z',
  'M16.7871 16.5138C16.7871 17.2834 17.4635 17.8991 18.2879 17.8991C19.1123 17.8991 19.7886 17.2834 19.7886 16.5138C19.7886 15.7442 19.1123 15.1284 18.2879 15.1284C17.4635 15.1504 16.7871 15.7662 16.7871 16.5138Z',
  'M6.70383 16.5138C6.70383 18.229 8.56401 19.6143 10.8681 19.6143C13.1511 19.6363 15.0324 18.251 15.0324 16.5358C15.0324 14.8207 13.1722 13.4353 10.8681 13.4353C8.58515 13.4353 6.70383 14.8207 6.70383 16.5138Z',
  'M21.4373 12.138C21.0568 12.3799 21.0357 13.0835 21.3739 13.7212C21.7332 14.3589 22.3462 14.6667 22.7267 14.4249C23.1072 14.183 23.1283 13.4793 22.7901 12.8416C22.4519 12.2699 21.9657 11.8961 21.6486 11.9841C21.564 12.0281 21.4795 12.0721 21.4373 12.138Z',
  'M15.4339 9.30138C14.99 10.093 15.6453 11.3244 16.8713 12.05C18.0973 12.7757 19.4291 12.7977 19.8942 12.006C20.3382 11.2144 19.6829 9.98298 18.4569 9.25738C17.2308 8.53178 15.8778 8.53178 15.4339 9.30138Z',
  'M21.5218 5.93707C21.1413 6.15696 21.3315 7.32239 21.9657 8.57577C22.5998 9.82916 23.4242 10.6867 23.8047 10.4668C24.1852 10.269 23.9738 9.10353 23.3608 7.85015C22.7267 6.59676 21.9023 5.7392 21.5218 5.93707Z',
  'M0.0663705 1.91301C-0.440953 3.21037 2.03225 5.49725 5.60465 7.03649C9.17705 8.57577 12.5169 8.86165 13.0031 7.56429C13.5104 6.26694 11.0372 3.98008 7.46485 2.44078C3.89241 0.923497 0.573634 0.615658 0.0663705 1.91301Z',
  'M13.2988 0.329838C12.7914 1.07747 13.8906 2.77064 15.7297 4.13397C17.5687 5.4973 19.4923 5.9811 19.9995 5.23347C20.5069 4.48583 19.4076 2.79263 17.5686 1.4293C15.7296 0.0879671 13.8061 -0.395826 13.2988 0.329838Z',
];

// Container size mapped to viewBox 24×33 by CSS scaling.
export const Loader = forwardRef<HTMLSpanElement, LoaderProps>(function Loader(
  { size = 'medium', label = 'Loading', style, ...rest },
  ref,
) {
  const spec = SIZE_SPECS[size];
  const wrapperStyle: CSSProperties = {
    display: 'inline-block',
    width: spec.width,
    height: spec.height,
    color: semantic.text.tertiary ?? '#4c5d72',
    ...style,
  };
  return (
    <span
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-live="polite"
      style={wrapperStyle}
      {...rest}
    >
      <svg
        viewBox="0 0 24 33"
        width="100%"
        height="100%"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <style>{`
          @keyframes origonPetalPulse {
            0%, 100% { opacity: 0.35; }
            30%      { opacity: 1; }
          }
          .origon-loader-petal {
            animation: origonPetalPulse 1.05s ease-in-out infinite;
            transform-origin: 12px 16.5px;
          }
          @media (prefers-reduced-motion: reduce) {
            .origon-loader-petal {
              animation: none;
              opacity: 0.7;
            }
          }
        `}</style>
        {PETALS.map((d, i) => (
          <path
            key={i}
            d={d}
            fillRule="evenodd"
            clipRule="evenodd"
            className="origon-loader-petal"
            style={{
              // Wave — each petal offset by ~1/12 of the cycle.
              animationDelay: `${(i / PETALS.length) * -1.05}s`,
            }}
          />
        ))}
      </svg>
    </span>
  );
});
