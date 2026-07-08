import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  args: {
    placeholder: 'Choose a pair',
    disabled: false,
    combobox: false,
    fullWidth: false,
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

const pairs = [
  { value: 'BTCTRY', label: 'BTC / TRY' },
  { value: 'ETHTRY', label: 'ETH / TRY' },
  { value: 'SOLTRY', label: 'SOL / TRY' },
  { value: 'AVAXTRY', label: 'AVAX / TRY', disabled: true },
];

export const Default: Story = {
  render: (args) => {
    const [pair, setPair] = useState<string | undefined>();
    return <Dropdown {...args} options={pairs} value={pair} onChange={setPair} />;
  },
};

export const Combobox: Story = {
  args: { combobox: true },
  render: (args) => {
    const [pair, setPair] = useState<string | undefined>();
    return <Dropdown {...args} options={pairs} value={pair} onChange={setPair} />;
  },
};

export const KeyboardOnly: Story = {
  parameters: { docs: { description: { story: 'Focus the trigger and press ArrowDown / Enter / Escape / ArrowUp.' } } },
  render: () => {
    const [v, setV] = useState<string | undefined>();
    return <Dropdown options={pairs} value={v} onChange={setV} placeholder="Tab here, then keyboard" />;
  },
};
