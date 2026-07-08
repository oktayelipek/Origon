import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library auto-cleanup between tests.
afterEach(() => cleanup());

// jsdom doesn't implement scrollIntoView — force-install a no-op shim.
Element.prototype.scrollIntoView = function () {};

// jsdom doesn't implement PointerEvent (used by RangeSlider).
if (typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined') {
  // @ts-expect-error — shim
  window.PointerEvent = window.MouseEvent;
}
