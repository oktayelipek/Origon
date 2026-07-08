import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './Menu';
import { Button } from '../Button/Button';

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  render: () => (
    <Menu
      trigger={<Button variant="outline">Actions ▾</Button>}
      onSelect={(v) => alert(`Selected: ${v}`)}
      items={[
        { value: 'copy', label: 'Copy address' },
        { value: 'share', label: 'Share' },
        { value: 'export', label: 'Export CSV', divider: true },
        { value: 'archive', label: 'Archive' },
        { value: 'delete', label: 'Delete', danger: true, divider: true },
      ]}
    />
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <Menu
      trigger={<Button variant="outline">Open ▾</Button>}
      items={[
        { value: 'a', label: 'Available' },
        { value: 'b', label: 'Coming soon', disabled: true },
        { value: 'c', label: 'Locked (Enterprise)', disabled: true },
      ]}
    />
  ),
};
