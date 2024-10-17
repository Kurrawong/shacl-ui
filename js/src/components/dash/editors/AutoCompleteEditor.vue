<script setup lang="ts">
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { type NamedNode } from 'n3'
import AutoCompleteEditorLocal from './AutoCompleteEditorLocal.vue'
// import AutoCompleteEditorRemote from './AutoCompleteEditorRemote.vue'
interface Props {
  term: NamedNode
  constraintComponents: ConstraintComponent[]
  dataGraph: NamedNode
}

const props = defineProps<Props>()
</script>

<template>
  <AutoCompleteEditorLocal
    :term="props.term"
    :constraint-components="props.constraintComponents"
    :data-graph="props.dataGraph"
  />
</template>
