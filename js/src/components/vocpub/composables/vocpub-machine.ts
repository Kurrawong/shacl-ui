import { inject, provide } from 'vue'

const VOC_PUB_MACHINE_KEY = Symbol('vocPubMachine')

export function provideVocPubMachine(send: (event: any) => void) {
  provide(VOC_PUB_MACHINE_KEY, send)
}

export function useVocPubMachine() {
  const send = inject(VOC_PUB_MACHINE_KEY)
  if (!send) {
    throw new Error('VocPub machine not provided')
  }
  return { send }
}
