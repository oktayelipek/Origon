import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationBadge, Button } from '../src';

describe('NotificationBadge', () => {
  it('hides badge when count is 0', () => {
    render(<NotificationBadge count={0}><Button>Inbox</Button></NotificationBadge>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows count when > 0', () => {
    render(<NotificationBadge count={5}><Button>Inbox</Button></NotificationBadge>);
    expect(screen.getByRole('status')).toHaveTextContent('5');
  });

  it('caps at max with +', () => {
    render(<NotificationBadge count={150} max={99}><Button>Inbox</Button></NotificationBadge>);
    expect(screen.getByRole('status')).toHaveTextContent('99+');
  });

  it('shows 0 when showZero is set', () => {
    render(<NotificationBadge count={0} showZero><Button>Inbox</Button></NotificationBadge>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders dot mode without text', () => {
    render(<NotificationBadge dot><Button>Inbox</Button></NotificationBadge>);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('');
  });
});
