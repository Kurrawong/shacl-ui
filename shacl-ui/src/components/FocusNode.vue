<script setup lang="ts">
import { computed } from 'vue'
import type { BlankNode, NamedNode, Literal } from '@rdfjs/types'
import type { AnyPointer } from 'clownface'
import IdentifiedFocusNode from '@/components/IdentifiedFocusNode.vue'
import { UISHACLValidator } from '@/lib/shapes-graph'

const { focusNode, nodeShape, dataGraph, validator } = withDefaults(
  defineProps<{
    focusNode: NamedNode | BlankNode | Literal
    nodeShape?: NamedNode | BlankNode | null
    dataGraph: AnyPointer
    validator: UISHACLValidator
    isRootNode?: boolean
  }>(),
  {
    nodeShape: null,
    isRootNode: false,
  },
)

const isIdentifiedNode = computed(
  () => focusNode.termType === 'NamedNode' || focusNode.termType === 'BlankNode',
)

const identifiedFocusNode = computed(() => {
  if (isIdentifiedNode.value) {
    return focusNode as NamedNode | BlankNode
  }
  return null
})
</script>

<template>
  <template v-if="isIdentifiedNode">
    <IdentifiedFocusNode
      :focus-node="identifiedFocusNode!"
      :node-shape="nodeShape"
      :data-graph="dataGraph"
      :validator="validator"
      :is-root-node="isRootNode"
    />
  </template>
  <template v-else> It's a literal! </template>
</template>
