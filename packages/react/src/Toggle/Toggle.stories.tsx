import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  args: {
    label: 'Push notifications',
    size: 'medium',
    labelPosition: 'right',
    disabled: false,
  },
  argTypes: {
    size:          { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    labelPosition: { control: 'inline-radio', options: ['left', 'right'] },
  },
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: (args) => {
    const [on, setOn] = useState(true);
    return <Toggle {...args} checked={on} onChange={setOn} />;
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Toggle label="Small" size="small" checked />
      <Toggle label="Medium" size="medium" checked />
      <Toggle label="Large" size="large" checked />
    </div>
  ),
};
