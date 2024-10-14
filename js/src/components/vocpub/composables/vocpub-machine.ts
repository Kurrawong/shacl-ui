import { inject, provide } from 'vue'

const VOC_PUB_MACHINE_KEY = Symbol('vocPubMachine')

export function provideVocPubMachine(snapshot: any, send: (event: any) => void) {
  provide(VOC_PUB_MACHINE_KEY, { snapshot, send })
}

export function useVocPubMachine() {
  const { snapshot, send } = inject(VOC_PUB_MACHINE_KEY) as {
    snapshot: any
    send: (event: any) => void
  }
  if (!send) {
    throw new Error('VocPub machine not provided')
  }
  return { snapshot, send }
}
