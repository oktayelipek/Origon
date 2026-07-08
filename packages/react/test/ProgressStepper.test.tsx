import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressStepper } from '../src';

const steps = [
  { label: 'Contact' },
  { label: 'Identity' },
  { label: 'Address' },
];

describe('ProgressStepper', () => {
  it('renders as ordered list', () => {
    render(<ProgressStepper steps={steps} active={1} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks active step with aria-current', () => {
    render(<ProgressStepper steps={steps} active={1} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  it('renders all step labels', () => {
    render(<ProgressStepper steps={steps} active={0} />);
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Identity')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });
});
