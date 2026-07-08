import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './Toast';
import { Button } from '../Button/Button';

const meta: Meta = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
};
export default meta;

function TriggerRow() {
  const { toast } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="outline" onClick={() => toast({ message: 'Portfolio refreshed', tone: 'info' })}>Info</Button>
      <Button variant="outline" onClick={() => toast({ title: 'Order filled', message: 'BTC/TRY @ 3,458,000', tone: 'success' })}>Success + title</Button>
      <Button variant="outline" onClick={() => toast({ message: 'Fee schedule changes in 3 days', tone: 'warning' })}>Warning</Button>
      <Button variant="outline" onClick={() => toast({ message: 'Order rejected — insufficient balance', tone: 'danger' })}>Danger</Button>
      <Button variant="outline" onClick={() => toast({ message: 'Sticky, click Undo', duration: 0, action: { label: 'Undo', onClick: () => {} } })}>Sticky + action</Button>
    </div>
  );
}

export const AllTones: StoryObj = {
  render: () => <TriggerRow />,
};
