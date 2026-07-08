import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chip } from '../src';

describe('Chip', () => {
  it('renders as span when not interactive', () => {
    const { container } = render(<Chip>BTC</Chip>);
    expect(container.querySelector('span')).toBeInTheDocument();
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('renders as button role="switch" when selected is defined', () => {
    render(<Chip selected={false} onSelect={() => {}}>1D</Chip>);
    const chip = screen.getByRole('switch');
    expect(chip).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles selection via onSelect', async () => {
    const onSelect = vi.fn();
    render(<Chip selected={false} onSelect={onSelect}>1D</Chip>);
    await userEvent.click(screen.getByRole('switch'));
    expect(onSelect).toHaveBeenCalledWith(true);
  });
});
