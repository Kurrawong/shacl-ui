import { ref, triggerRef } from 'vue'
import n3 from 'n3'

export function useStore(data?: string) {
  const parser = new n3.Parser()
  const store = ref(new n3.Store())
  if (data) {
    store.value.addQuads(parser.parse(data))
  }

  function addQuad(quad: n3.Quad) {
    store.value.addQuad(quad)
    triggerRef(store)
  }

  return { store, addQuad }
}
