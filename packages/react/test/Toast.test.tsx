import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast, Button } from '../src';

function Trigger() {
  const { toast } = useToast();
  return (
    <>
      <Button onClick={() => toast({ message: 'Order placed', tone: 'success', duration: 300 })}>Post</Button>
      <Button onClick={() => toast({ title: 'Uh oh', message: 'Rejected', tone: 'danger', duration: 0 })}>Sticky</Button>
    </>
  );
}

describe('Toast', () => {
  it('shows a toast when enqueued', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Trigger /></ToastProvider>);
    await user.click(screen.getByRole('button', { name: 'Post' }));
    expect(await screen.findByText('Order placed')).toBeInTheDocument();
  });

  it('auto-dismisses after duration', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Trigger /></ToastProvider>);
    await user.click(screen.getByRole('button', { name: 'Post' }));
    await waitFor(() => expect(screen.queryByText('Order placed')).not.toBeInTheDocument(), { timeout: 1000 });
  });

  it('sticky toast (duration=0) is dismissible via close button', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Trigger /></ToastProvider>);
    await user.click(screen.getByRole('button', { name: 'Sticky' }));
    expect(await screen.findByText('Rejected')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Rejected')).not.toBeInTheDocument();
  });
});
