import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Bullet } from '../src';

describe('Bullet', () => {
  it('renders count items with tablist role', () => {
    const { container } = render(<Bullet count={5} active={2} />);
    const list = screen.getByRole('tablist');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(5);
    expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it('marks the active index with aria-current', () => {
    const { container } = render(<Bullet count={4} active={0} />);
    const active = container.querySelector('[aria-current="step"]');
    expect(active).toBeInTheDocument();
  });

  it('advertises step position in aria-label', () => {
    render(<Bullet count={4} active={2} />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Step 3 of 4');
  });
});
