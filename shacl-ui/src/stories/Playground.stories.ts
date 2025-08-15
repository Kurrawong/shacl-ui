import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Playground from '@/components/Playground.vue'

const meta = {
  title: 'Components/Playground',
  component: Playground,
  tags: ['autodocs'],
} satisfies Meta<typeof Playground>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
