import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: {
    children: 'Label',
    size: 'md',
    variant: 'line',
  },
  argTypes: {
    size:    { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['line', 'solid'] },
  },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Display: Story = {};

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Chip {...args} size="xs">XS</Chip>
      <Chip {...args} size="sm">Small</Chip>
      <Chip {...args} size="md">Medium</Chip>
      <Chip {...args} size="lg">Large</Chip>
    </div>
  ),
};

export const SelectorGroup: Story = {
  render: () => {
    const [period, setPeriod] = useState('1D');
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {['1D', '1W', '1M', '3M', '1Y'].map((p) => (
          <Chip key={p} size="xs" selected={period === p} onSelect={() => setPeriod(p)}>{p}</Chip>
        ))}
      </div>
    );
  },
};
