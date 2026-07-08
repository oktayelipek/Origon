import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Gauge } from '../src';

describe('Gauge', () => {
  it('renders as meter role with valuenow', () => {
    render(<Gauge value={75} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '75');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps out-of-range values', () => {
    render(<Gauge value={150} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows numeric label by default', () => {
    render(<Gauge value={42} />);
    expect(screen.getByText('%42')).toBeInTheDocument();
  });

  it('hides label when showLabel=false', () => {
    render(<Gauge value={42} showLabel={false} />);
    expect(screen.queryByText('%42')).not.toBeInTheDocument();
  });
});
