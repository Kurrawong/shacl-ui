import type { Meta, StoryObj } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import VocPubEditor from '@/components/vocpub/VocPubEditor.vue'
import router from '@/components/vocpub/router'

setup((app) => {
  app.use(router)
})

const meta = {
  title: 'VocPub Editor',
  component: VocPubEditor,
  tags: ['autodocs']
} satisfies Meta<typeof VocPubEditor>

export default meta

type Story = StoryObj<typeof meta>

export const main: Story = {}
