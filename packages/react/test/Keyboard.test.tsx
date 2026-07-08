import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Keyboard } from '../src';

describe('Keyboard', () => {
  it('renders 12 numeric keys + backspace', () => {
    render(<Keyboard />);
    // 0-9 = 10 keys, plus backspace.
    for (const n of ['0','1','2','3','4','5','6','7','8','9']) {
      expect(screen.getByRole('button', { name: `Key ${n}` })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Backspace' })).toBeInTheDocument();
  });

  it('includes decimal key when layout=decimal', () => {
    render(<Keyboard layout="decimal" />);
    expect(screen.getByRole('button', { name: 'Key .' })).toBeInTheDocument();
  });

  it('fires onKey with the digit', async () => {
    const onKey = vi.fn();
    render(<Keyboard onKey={onKey} />);
    await userEvent.click(screen.getByRole('button', { name: 'Key 5' }));
    expect(onKey).toHaveBeenCalledWith('5');
  });

  it('fires onBackspace', async () => {
    const onBackspace = vi.fn();
    render(<Keyboard onBackspace={onBackspace} />);
    await userEvent.click(screen.getByRole('button', { name: 'Backspace' }));
    expect(onBackspace).toHaveBeenCalled();
  });

  it('shows confirm key only when onConfirm is provided', async () => {
    const onConfirm = vi.fn();
    render(<Keyboard onConfirm={onConfirm} />);
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalled();
  });
});
