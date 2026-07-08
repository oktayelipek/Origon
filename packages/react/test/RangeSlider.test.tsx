import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RangeSlider } from '../src';

describe('RangeSlider', () => {
  it('renders single-thumb variant with slider role', () => {
    render(<RangeSlider value={50} onChange={() => {}} label="Volume" />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(1);
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders dual-thumb variant with two sliders', () => {
    render(<RangeSlider value={[20, 80]} onChange={() => {}} label="Price range" />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '20');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '80');
  });

  it('sets min/max via aria attrs', () => {
    render(<RangeSlider value={5} onChange={() => {}} min={0} max={10} label="Amount" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
  });

  it('respects disabled by removing focusability', () => {
    render(<RangeSlider value={50} onChange={() => {}} disabled />);
    expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '-1');
  });
});
