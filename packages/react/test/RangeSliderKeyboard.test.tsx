import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RangeSlider } from '../src';

describe('RangeSlider keyboard nav', () => {
  it('ArrowRight increments single value by step', async () => {
    const onChange = vi.fn();
    render(<RangeSlider value={50} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(51);
  });

  it('ArrowLeft decrements', async () => {
    const onChange = vi.fn();
    render(<RangeSlider value={50} onChange={onChange} />);
    screen.getByRole('slider').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith(49);
  });

  it('Home / End jump to min / max', async () => {
    const onChange = vi.fn();
    render(<RangeSlider value={50} onChange={onChange} min={0} max={100} />);
    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('PageUp moves by 10x step', async () => {
    const onChange = vi.fn();
    render(<RangeSlider value={50} onChange={onChange} step={1} />);
    screen.getByRole('slider').focus();
    await userEvent.keyboard('{PageUp}');
    expect(onChange).toHaveBeenLastCalledWith(60);
  });

  it('dual thumb — low arrow does not cross high', async () => {
    const onChange = vi.fn();
    render(<RangeSlider value={[49, 50]} onChange={onChange} step={1} />);
    const [lowThumb] = screen.getAllByRole('slider');
    lowThumb.focus();
    await userEvent.keyboard('{ArrowRight}');
    // Clamped: low can move up to high - step = 49 (stays put).
    expect(onChange).toHaveBeenLastCalledWith([49, 50]);
  });
});
