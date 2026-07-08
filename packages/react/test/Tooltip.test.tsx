import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, Button } from '../src';

describe('Tooltip', () => {
  it('shows tooltip on hover after delay', async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Hint" delay={50}><Button>Anchor</Button></Tooltip>);
    await user.hover(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Hint'), { timeout: 500 });
  });

  it('hides on mouseleave', async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Hint" delay={50}><Button>Anchor</Button></Tooltip>);
    const btn = screen.getByRole('button');
    await user.hover(btn);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument(), { timeout: 500 });
    await user.unhover(btn);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show when disabled', async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Hint" disabled delay={0}><Button>Anchor</Button></Tooltip>);
    await user.hover(screen.getByRole('button'));
    await new Promise((r) => setTimeout(r, 100));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
