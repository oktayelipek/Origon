import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from '../src';

const options = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M', disabled: true },
];

describe('SegmentedControl', () => {
  it('renders as radiogroup', () => {
    render(<SegmentedControl options={options} value="1D" />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('marks selection with aria-checked', () => {
    render(<SegmentedControl options={options} value="1W" />);
    expect(screen.getByRole('radio', { name: '1W' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '1D' })).toHaveAttribute('aria-checked', 'false');
  });

  it('fires onChange on click', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="1D" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: '1W' }));
    expect(onChange).toHaveBeenCalledWith('1W');
  });

  it('skips disabled options', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="1D" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: '1M' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
