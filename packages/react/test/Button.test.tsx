import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../src';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Buy</Button>);
    expect(screen.getByRole('button', { name: 'Buy' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respects the disabled prop', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders icon in each iconPosition', () => {
    const icon = <span data-testid="icon">★</span>;
    const { rerender } = render(<Button icon={icon} iconPosition="leading">Buy</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    rerender(<Button icon={icon} iconPosition="trailing">Buy</Button>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    rerender(<Button icon={icon} iconPosition="only" aria-label="Buy" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy' })).toBeInTheDocument();
  });

  it('applies fullWidth style', () => {
    render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ width: '100%' });
  });
});
