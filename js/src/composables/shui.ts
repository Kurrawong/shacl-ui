import { computed, ref } from 'vue'
import type { Quad } from '@rdfjs/types'
import { Shui } from '@/core/shui'

const shui = ref(new Shui())
const _serverMode = ref(false)
const _sparqlUrl = ref('')

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

  const serverMode = computed(() => _serverMode.value)

  const setServerMode = (value: boolean) => {
    _serverMode.value = value
  }

  const sparqlUrl = computed(() => _sparqlUrl.value)

  const setSparqlUrl = (value: string) => {
    _sparqlUrl.value = value
  }

  return {
    shui,
    addQuads,
    removeQuads,
    parse,
    reset,
    serverMode,
    setServerMode,
    sparqlUrl,
    setSparqlUrl
  }
}
