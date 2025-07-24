<script setup lang="ts">
import type { NamedNode, BlankNode } from '@rdfjs/types'
import { useStore } from '@/composables/store'
import FocusNode from '@/components/FocusNode.vue'
import { UISHACLValidator } from '@/lib/shapes-graph'

const props = withDefaults(
  defineProps<{
    focusNode: NamedNode | BlankNode
    dataGraph: string
    shapesGraph: string
    nodeShape: NamedNode | BlankNode | null
    isRootNode?: boolean
  }>(),
  {
    isRootNode: false,
  },
)

const { store: dataGraph } = useStore(props.dataGraph)
const { store: shapesGraph } = useStore(props.shapesGraph)

const validator = new UISHACLValidator(shapesGraph.value)
const dataGraphPointer = validator.factory.clownface({ dataset: dataGraph.value })
</script>

<template>
  <FocusNode
    :focus-node="focusNode"
    :node-shape="nodeShape"
    :data-graph="dataGraphPointer"
    :validator="validator"
    :is-root-node="true"
  />
</template>
