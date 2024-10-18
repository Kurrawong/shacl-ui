import { ref } from 'vue'
import { useShui } from './shui'
import type { BlankNode, NamedNode } from 'n3'
import type { ConstraintComponent } from '@/core/constraint-components/constraint-component'

const { sparqlUrl } = useShui()

export function useAutocomplete(
  constraintComponents: ConstraintComponent[],
  dataGraphName: NamedNode | BlankNode
) {
  const isLoading = ref(false)
  const isError = ref(false)
  const errorMessage = ref('')

  async function getSuggestions(query: string) {
    isLoading.value = true
    isError.value = false
    errorMessage.value = ''
    try {
      const response = await fetch(sparqlUrl.value, {
        method: 'POST',
        body: query
      })
      const data = await response.json()
      isLoading.value = false
      return data
    } catch (error) {
      isLoading.value = false
      isError.value = true
      errorMessage.value = error as string
      return []
    }
  }

  return {
    getSuggestions,
    isLoading,
    isError,
    errorMessage
  }
}
