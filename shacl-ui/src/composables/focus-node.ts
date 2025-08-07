import { inject, provide, ref, readonly, type Ref, type DeepReadonly } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'

const FocusNodeKey = Symbol('FocusNode')

export const provideFocusNode = (initialFocusNode: NamedNode | BlankNode) => {
  const focusNode = ref(initialFocusNode)

  provide(FocusNodeKey, {
    focusNode: readonly(focusNode),
  })

  return {
    focusNode: readonly(focusNode),
  }
}

export const useFocusNodeContext = () => {
  const focusNode = inject<{
    focusNode: DeepReadonly<Ref<NamedNode | BlankNode>>
  }>(FocusNodeKey)!

  if (!focusNode) {
    throw new Error('FocusNode not found')
  }
  return focusNode
}
