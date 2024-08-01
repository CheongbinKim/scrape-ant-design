import type { Meta, StoryObj } from '@storybook/react';
import { Button } from 'antd';

const meta = {
  title: 'General/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs:{
        page: CustomDocs,
    }
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    type: 'primary',
    children: 'Button',
    style: { position: 'relative' },
  },
};