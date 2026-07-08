import type { Meta, StoryObj } from '@storybook/react';
import { Chart } from './Chart';

const meta: Meta<typeof Chart> = {
  title: 'Components/Chart',
  component: Chart,
  tags: ['autodocs'],
  args: {
    width: 360,
    height: 200,
    showGrid: true,
    showTooltip: true,
    kind: 'line',
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['line', 'area', 'bar', 'candlestick'] },
  },
};
export default meta;

type Story = StoryObj<typeof Chart>;

const priceData = [10, 12, 9, 15, 18, 16, 22, 24, 21, 27, 26, 30];

export const Line: Story = {
  args: { kind: 'line', series: [{ label: 'BTC', data: priceData }] },
};

export const Area: Story = { args: { kind: 'area', series: [{ label: 'BTC', data: priceData }] } };

export const Bar: Story = { args: { kind: 'bar', series: [{ label: 'Volume', data: [5, 8, 3, 12, 7, 10, 6] }] } };

export const Candlestick: Story = {
  args: {
    kind: 'candlestick',
    ohlc: [
      { open: 100, high: 108, low: 98,  close: 105, label: '12:00' },
      { open: 105, high: 112, low: 103, close: 110, label: '13:00' },
      { open: 110, high: 115, low: 106, close: 108, label: '14:00' },
      { open: 108, high: 111, low: 100, close: 102, label: '15:00' },
      { open: 102, high: 104, low: 96,  close: 97,  label: '16:00' },
      { open: 97,  high: 105, low: 96,  close: 104, label: '17:00' },
      { open: 104, high: 112, low: 103, close: 111, label: '18:00' },
      { open: 111, high: 118, low: 110, close: 116, label: '19:00' },
    ],
  },
};

export const MultiSeries: Story = {
  args: {
    kind: 'line',
    series: [
      { label: 'BTC', color: '#4fa963', data: priceData },
      { label: 'ETH', color: '#dc3323', data: priceData.map((v) => 30 - v * 0.5) },
    ],
  },
};
