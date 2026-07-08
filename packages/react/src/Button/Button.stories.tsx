import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'CTA Text',
    size: 'large',
    variant: 'primary',
    presence: 'default',
    iconPosition: 'leading',
    direction: 'horizontal',
    disabled: false,
    fullWidth: false,
  },
  argTypes: {
    size:         { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    variant:      { control: 'inline-radio', options: ['primary', 'focus', 'outline', 'ghost'] },
    presence:     { control: 'inline-radio', options: ['default', 'subtle'] },
    iconPosition: { control: 'inline-radio', options: ['leading', 'trailing', 'only'] },
    direction:    { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button {...args} variant="primary" />
      <Button {...args} variant="focus" />
      <Button {...args} variant="outline" />
      <Button {...args} variant="ghost" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="small" />
      <Button {...args} size="medium" />
      <Button {...args} size="large" />
    </div>
  ),
};

export const Subtle: Story = {
  args: { presence: 'subtle', variant: 'primary' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M12 2 15 9 22 9.5l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.7L2 9.5 9 9z" />
  </svg>
);

export const WithIcon: Story = {
  args: { icon: <Star /> },
};

export const VerticalIcon: Story = {
  args: { direction: 'vertical', icon: <Star />, size: 'medium' },
};
