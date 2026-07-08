import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../src';

describe('Input', () => {
  it('associates label with input via htmlFor', () => {
    render(<Input label="Email" placeholder="you@example.com" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('displays hint text', () => {
    render(<Input label="Email" hint="Doğrulama linki bu adrese gider" />);
    expect(screen.getByText(/Doğrulama linki/)).toBeInTheDocument();
  });

  it('shows error and sets aria-invalid', () => {
    render(<Input label="Email" error="Invalid email" defaultValue="bad" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls onChange with typed characters', async () => {
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Name'), 'abc');
    expect(onChange).toHaveBeenCalled();
  });

  it('honors disabled', () => {
    render(<Input label="Locked" disabled defaultValue="x" />);
    expect(screen.getByLabelText('Locked')).toBeDisabled();
  });
});
