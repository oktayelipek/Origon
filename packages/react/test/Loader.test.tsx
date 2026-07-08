import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from '../src';

describe('Loader', () => {
  it('has role progressbar with default label', () => {
    render(<Loader />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-label', 'Loading');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('accepts custom label', () => {
    render(<Loader label="Fetching portfolio" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Fetching portfolio');
  });
});
