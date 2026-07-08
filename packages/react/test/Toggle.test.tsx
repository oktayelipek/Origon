import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../src';

describe('Toggle', () => {
  it('has role switch + aria-checked', () => {
    render(<Toggle label="Notifications" checked />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with next value', async () => {
    const onChange = vi.fn();
    render(<Toggle label="X" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('X'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('respects disabled', async () => {
    const onChange = vi.fn();
    render(<Toggle label="Locked" checked disabled onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Locked'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
