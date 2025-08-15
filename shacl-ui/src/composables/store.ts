import { ref } from 'vue'
import type { Quad } from '@rdfjs/types'
import n3 from 'n3'

export function useStore(data?: string) {
  const parser = new n3.Parser({ blankNodePrefix: '' })
  const store = ref(new n3.Store())
  resetStore(data ? parser.parse(data) : [])

  function resetStore(quads: Quad[]) {
    store.value = new n3.Store()
    addQuads(quads)
  }

  function addQuad(quad: Quad) {
    store.value = new n3.Store(Array.from(store.value).concat([quad]))
  }

  function addQuads(quads: Quad[]) {
    store.value = new n3.Store(Array.from(store.value).concat(quads))
  }

  function deleteQuad(quad: Quad) {
    store.value = new n3.Store(Array.from(store.value).filter((q) => !q.equals(quad)))
  }

  function deleteQuads(quads: Quad[]) {
    store.value = new n3.Store(
      Array.from(store.value).filter((q) => !quads.some((q2) => q2.equals(q))),
    )
  }

  return { store, addQuad, addQuads, deleteQuad, deleteQuads, resetStore }
}
