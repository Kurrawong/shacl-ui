import { ref, provide, inject, watch, type Ref } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'

const ResourceLabelKey = Symbol('ResourceLabel')

export function provideResourceLabel(initialResourceLabel: Ref<NamedNode | BlankNode | Literal>) {
  const resourceLabel = ref<NamedNode | BlankNode | Literal>(initialResourceLabel.value)

  watch(initialResourceLabel, (newValue) => {
    resourceLabel.value = newValue
  })

  function getResourceLabel() {
    return resourceLabel.value
  }

  function setResourceLabel(newResourceLabel: NamedNode | BlankNode | Literal) {
    resourceLabel.value = newResourceLabel
  }

  provide(ResourceLabelKey, {
    getResourceLabel,
    setResourceLabel,
  })

  return {
    getResourceLabel,
    setResourceLabel,
  }
}

export function useResourceLabelContext() {
  const resourceLabel = inject<{
    getResourceLabel: () => NamedNode | BlankNode | Literal
    setResourceLabel: (newResourceLabel: NamedNode | BlankNode | Literal) => void
  }>(ResourceLabelKey)
  if (!resourceLabel) {
    throw new Error('ResourceLabel not found')
  }
  return resourceLabel
}
