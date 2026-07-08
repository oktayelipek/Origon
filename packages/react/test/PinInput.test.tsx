import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PinInput } from '../src';
import { useState } from 'react';

function Harness({ length = 6, onComplete }: { length?: 4 | 6; onComplete?: (v: string) => void }) {
  const [v, setV] = useState('');
  return <PinInput length={length} value={v} onChange={setV} onComplete={onComplete} />;
}

describe('PinInput', () => {
  it('renders `length` input boxes with role group', () => {
    render(<Harness length={6} />);
    const boxes = screen.getAllByLabelText(/Digit \d/);
    expect(boxes).toHaveLength(6);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('auto-advances focus on digit entry', async () => {
    render(<Harness length={4} />);
    const boxes = screen.getAllByLabelText(/Digit \d/);
    (boxes[0] as HTMLInputElement).focus();
    await userEvent.keyboard('1');
    expect(boxes[1]).toHaveFocus();
    await userEvent.keyboard('2');
    expect(boxes[2]).toHaveFocus();
  });

  it('calls onComplete once the last digit is entered', async () => {
    const onComplete = vi.fn();
    render(<Harness length={4} onComplete={onComplete} />);
    const boxes = screen.getAllByLabelText(/Digit \d/);
    (boxes[0] as HTMLInputElement).focus();
    await userEvent.keyboard('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('backspace on empty box moves focus back and clears prev', async () => {
    render(<Harness length={4} />);
    const boxes = screen.getAllByLabelText(/Digit \d/);
    (boxes[0] as HTMLInputElement).focus();
    await userEvent.keyboard('12');
    // After typing '12': box0='1', box1='2', focus advances to box2 (empty).
    // Backspace on empty box2 moves focus back to box1 and clears it.
    await userEvent.keyboard('{Backspace}');
    expect(boxes[1]).toHaveFocus();
    expect((boxes[1] as HTMLInputElement).value).toBe('');
  });
});
