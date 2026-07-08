import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '../src';

const items = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C', disabled: true },
];

describe('Tabs', () => {
  it('marks the active tab with aria-selected', () => {
    render(<Tabs tabs={items} value="a" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange when a tab is clicked', async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={items} value="a" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('does not activate disabled tabs', async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={items} value="a" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'C' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uses defaultValue in uncontrolled mode', () => {
    render(<Tabs tabs={items} defaultValue="b" />);
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
  });
});
