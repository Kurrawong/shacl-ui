import { ref } from 'vue'
import type { Quad } from '@rdfjs/types'
import { Shui } from '@/shui'

const shui = ref(new Shui())

export function useShui() {
  const addQuads = (newQuads: Quad[]) => {
    shui.value.store.addQuads(newQuads)
    const quads = shui.value.store.getQuads(null, null, null, null)
    shui.value = new Shui()
    shui.value.store.addQuads(quads)
  }

  const removeQuads = (newQuads: Quad[]) => {
    shui.value.store.removeQuads(newQuads)
    const quads = shui.value.store.getQuads(null, null, null, null)
    shui.value = new Shui()
    shui.value.store.addQuads(quads)
  }

  const parse = (content: string) => {
    shui.value.parse(content)
    const quads = shui.value.store.getQuads(null, null, null, null)
    shui.value = new Shui()
    shui.value.store.addQuads(quads)
  }

  const reset = () => {
    shui.value = new Shui()
  }

  return {
    shui,
    addQuads,
    removeQuads,
    parse,
    reset
  }
}
