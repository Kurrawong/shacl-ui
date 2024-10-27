import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'
import '/src/assets/main.css'
import 'primeicons/primeicons.css'
// @ts-ignore
import Aura from '@/presets/aura'

import ShuiForm from '@/components/ShuiForm.vue'
import FocusNode from '@/components/FocusNode.vue'

export { createApp, PrimeVue, Aura, Tooltip, ToastService, ShuiForm, FocusNode }
export * from '@/composables/shui'
export * from '@/core/shui'
export * from '@/types'
export * from '@/core/namespaces'
