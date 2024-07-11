import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'

// @ts-ignore
import Aura from '@/presets/aura'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  unstyled: true,
  pt: Aura
})
app.directive('tooltip', Tooltip)

app.mount('#app')
