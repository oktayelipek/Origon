import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Filter, SortFilter } from '../src';

describe('Filter', () => {
  it('renders label + value', () => {
    render(<Filter label="Pair" value="BTC" />);
    expect(screen.getByRole('button')).toHaveTextContent(/Pair.*BTC/);
  });

  it('shows dismiss button when onDismiss is provided', async () => {
    const onDismiss = vi.fn();
    const onClick = vi.fn();
    render(<Filter label="Pair" value="BTC" onDismiss={onDismiss} onClick={onClick} />);
    const dismiss = screen.getByRole('button', { name: 'Clear filter' });
    await userEvent.click(dismiss);
    expect(onDismiss).toHaveBeenCalled();
    // Dismiss stopPropagation prevents onClick from firing.
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('SortFilter', () => {
  it('renders label and calls onClick', async () => {
    const onClick = vi.fn();
    render(<SortFilter label="Volume" direction="desc" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
