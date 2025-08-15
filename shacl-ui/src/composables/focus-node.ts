import { inject, provide, type Ref } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'

const FocusNodeKey = Symbol('FocusNode')

export const provideFocusNode = (focusNode: Ref<NamedNode | BlankNode>) => {
  provide(FocusNodeKey, {
    focusNode,
  })

  return {
    focusNode,
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
