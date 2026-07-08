import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '../src';

const options = [
  { value: 'btc', label: 'Bitcoin' },
  { value: 'eth', label: 'Ethereum' },
  { value: 'sol', label: 'Solana' },
];

describe('Dropdown', () => {
  it('renders trigger with placeholder when empty', () => {
    render(<Dropdown options={options} placeholder="Choose" />);
    expect(screen.getByRole('button', { name: /Choose/ })).toBeInTheDocument();
  });

  it('opens listbox on trigger click', async () => {
    render(<Dropdown options={options} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Bitcoin' })).toBeInTheDocument();
  });

  it('selects an option and closes', async () => {
    const onChange = vi.fn();
    render(<Dropdown options={options} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('option', { name: 'Ethereum' }));
    expect(onChange).toHaveBeenCalledWith('eth');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('filters options in combobox mode', async () => {
    render(<Dropdown options={options} combobox />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(screen.getByPlaceholderText('Search…'), 'sol');
    expect(screen.queryByRole('option', { name: 'Bitcoin' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Solana' })).toBeInTheDocument();
  });

  it('opens with ArrowDown when trigger is focused', async () => {
    render(<Dropdown options={options} />);
    const trigger = screen.getByRole('button');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
