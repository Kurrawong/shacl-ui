import { inject, provide, ref, type Ref } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'

const FocusNodeKey = Symbol('FocusNode')

export const provideFocusNode = (initialFocusNode: NamedNode | BlankNode) => {
  const focusNode = ref(initialFocusNode)

  provide(FocusNodeKey, {
    focusNode: focusNode,
  })

  return {
    focusNode: focusNode,
  }
}

export const useFocusNodeContext = () => {
  const focusNode = inject<{
    focusNode: Ref<NamedNode | BlankNode>
  }>(FocusNodeKey)!

  if (!focusNode) {
    throw new Error('FocusNode not found')
  }
  return focusNode
}
