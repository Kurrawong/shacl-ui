import { computed } from 'vue'
import { useResourceManagerContext } from '@/composables/resource-manager'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { sh, rdf } from '@/core/namespaces'

export function useAutocomplete(propertyShape?: Shape) {
  const { dataGraphPointer } = useResourceManagerContext()

  const shClass = computed(() => {
    if (propertyShape) {
      return propertyShape.shapeNodePointer.out(sh.class).term
    }

    return undefined
  })

  function getAutocompleteTerms(q: string) {
    const terms = dataGraphPointer.value.has(rdf.type, shClass.value)
    return terms.filter((term) => term.value.toLowerCase().includes(q.toLowerCase())).terms
  }

  return {
    getAutocompleteTerms,
  }
}
