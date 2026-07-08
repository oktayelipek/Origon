import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio, RadioGroup } from '../src';

describe('RadioGroup', () => {
  it('renders all radios inside a radiogroup', () => {
    render(
      <RadioGroup name="order" value="limit">
        <Radio value="limit" label="Limit" />
        <Radio value="market" label="Market" />
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getByLabelText('Limit')).toBeChecked();
    expect(screen.getByLabelText('Market')).not.toBeChecked();
  });

  it('calls onChange with the new value', async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup name="pace" value="fast" onChange={onChange}>
        <Radio value="fast" label="Fast" />
        <Radio value="slow" label="Slow" />
      </RadioGroup>,
    );
    await userEvent.click(screen.getByLabelText('Slow'));
    expect(onChange).toHaveBeenCalledWith('slow');
  });

  it('disables all radios when group is disabled', () => {
    render(
      <RadioGroup name="x" value="a" disabled>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    expect(screen.getByLabelText('A')).toBeDisabled();
    expect(screen.getByLabelText('B')).toBeDisabled();
  });
});
