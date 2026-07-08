import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu, Button } from '../src';

const items = [
  { value: 'edit', label: 'Edit' },
  { value: 'delete', label: 'Delete', danger: true },
  { value: 'archive', label: 'Archive', disabled: true },
];

describe('Menu', () => {
  it('does not render menu initially', () => {
    render(<Menu trigger={<Button>Open</Button>} items={items} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens on trigger click', async () => {
    render(<Menu trigger={<Button>Open</Button>} items={items} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
  });

  it('fires onSelect and closes', async () => {
    const onSelect = vi.fn();
    render(<Menu trigger={<Button>Open</Button>} items={items} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onSelect).toHaveBeenCalledWith('edit');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not fire for disabled items', async () => {
    const onSelect = vi.fn();
    render(<Menu trigger={<Button>Open</Button>} items={items} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const archive = screen.getByRole('menuitem', { name: 'Archive' });
    expect(archive).toBeDisabled();
    await userEvent.click(archive);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    render(<Menu trigger={<Button>Open</Button>} items={items} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
