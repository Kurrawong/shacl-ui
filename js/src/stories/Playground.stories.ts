import type { Meta, StoryObj } from '@storybook/vue3'
import Playground from '@/components/playground/Playground.vue'

const meta = {
  title: 'SHACL UI Playground',
  component: Playground,
  tags: ['autodocs']
} satisfies Meta<typeof Playground>

export default meta

type Story = StoryObj<typeof meta>

export const playground: Story = {}
