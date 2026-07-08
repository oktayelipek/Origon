import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../src';

describe('Checkbox', () => {
  it('renders label + input pair', () => {
    render(<Checkbox label="Accept terms" checked={false} />);
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('fires onChange with next state', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="X" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('X'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not fire onChange when disabled', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="X" checked={false} disabled onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('X'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets aria-invalid for error state', () => {
    render(<Checkbox label="Err" checked={false} error />);
    expect(screen.getByLabelText('Err')).toHaveAttribute('aria-invalid', 'true');
  });
});
