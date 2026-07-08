import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    size: 'large',
    fullWidth: true,
    disabled: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['large', 'small', 'x-small'] },
  },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithHint: Story = { args: { hint: 'Doğrulama linki bu adrese gider' } };

export const WithError: Story = { args: { error: 'Invalid email' } };

export const Controlled: Story = {
  render: (args) => {
    const [v, setV] = useState('');
    return <Input {...args} value={v} onChange={(e) => setV(e.target.value)} />;
  },
};
