<script setup lang="ts">
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { type NamedNode } from 'n3'
import AutoCompleteEditorLocal from './AutoCompleteEditorLocal.vue'
import AutoCompleteEditorRemote from './AutoCompleteEditorRemote.vue'
import { useShui } from '@/composables/shui'

interface Props {
  term: NamedNode
  constraintComponents: ConstraintComponent[]
  dataGraph: NamedNode
}

const { serverMode } = useShui()

const props = defineProps<Props>()
</script>

<template>
  <template v-if="serverMode">
    <AutoCompleteEditorRemote
      :term="props.term"
      :constraint-components="props.constraintComponents"
      :data-graph="props.dataGraph"
    />
  </template>
  <template v-else>
    <AutoCompleteEditorLocal
      :term="props.term"
      :constraint-components="props.constraintComponents"
      :data-graph="props.dataGraph"
    />
  </template>
</template>
