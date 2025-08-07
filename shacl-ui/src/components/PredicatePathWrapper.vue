<script setup lang="ts">
import { computed } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import { type Term } from 'n3'
import PredicatePath from '@/components/PredicatePath.vue'
import { useFocusNodeContext } from '@/composables/focus-node'
import { useResourceManagerContext } from '@/composables/resource-manager'

const props = defineProps<{
  path: NamedNode
}>()

const { focusNode } = useFocusNodeContext()
const { dataGraph } = useResourceManagerContext()

const pathLabel = computed(() => props.path.value.split('#').slice(-1)[0].split('/').slice(-1)[0])
const valueNodes = computed(() => {
  return Array.from(dataGraph.value.match(focusNode.value as Term, props.path as Term, null))
    .map((quad) => quad.object as NamedNode | BlankNode | Literal)
    .sort((a, b) => a.value.localeCompare(b.value))
})
</script>

<template>
  <PredicatePath :path="props.path" :path-label="pathLabel" :value-nodes="valueNodes" />
</template>
