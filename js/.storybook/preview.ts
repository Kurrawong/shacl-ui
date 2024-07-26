import type { Preview } from "@storybook/vue3"
import { setup } from "@storybook/vue3"
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'

import '@/assets/main.css'
import 'primeicons/primeicons.css'
// @ts-ignore
import Aura from '@/presets/aura'

setup((app) => {
  app.use(PrimeVue, {
    unstyled: true,
    pt: Aura
  });
  app.directive('tooltip', Tooltip)
  app.use(ToastService)
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;