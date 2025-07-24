import { ref, provide, inject } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'

const FormLabelKey = Symbol('FormLabel')

export function useProvideFormLabel(initialFormLabel: NamedNode | BlankNode | Literal) {
  const formLabel = ref<NamedNode | BlankNode | Literal>(initialFormLabel)

  function getFormLabel() {
    return formLabel.value
  }

  function setFormLabel(newFormLabel: NamedNode | BlankNode | Literal) {
    formLabel.value = newFormLabel
  }

  provide(FormLabelKey, {
    getFormLabel,
    setFormLabel,
  })

  return {
    getFormLabel,
    setFormLabel,
  }
}

export function useInjectFormLabel() {
  const formLabel = inject<{
    getFormLabel: () => NamedNode | BlankNode | Literal
    setFormLabel: (newFormLabel: NamedNode | BlankNode | Literal) => void
  }>(FormLabelKey)
  if (!formLabel) {
    throw new Error('FormLabel not found')
  }
  return formLabel
}
