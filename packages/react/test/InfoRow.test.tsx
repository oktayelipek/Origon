import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoRow } from '../src';

describe('InfoRow', () => {
  it('renders message with role status', () => {
    render(<InfoRow message="Portfolio updated" />);
    expect(screen.getByRole('status')).toHaveTextContent('Portfolio updated');
  });

  it('shows dismiss button when onDismiss is provided', async () => {
    const onDismiss = vi.fn();
    render(<InfoRow message="Msg" onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('renders icon when provided', () => {
    render(<InfoRow message="X" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
