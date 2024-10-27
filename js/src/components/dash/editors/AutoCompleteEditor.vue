<script setup lang="ts">
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { type NamedNode } from 'n3'
import AutoCompleteEditorLocal from '@/components/dash/editors/AutoCompleteEditorLocal.vue'
import AutoCompleteEditorRemote from '@/components/dash/editors/AutoCompleteEditorRemote.vue'
import { useShui } from '@/composables/shui'

interface Props {
  term: NamedNode
  constraintComponents: ConstraintComponent[]
  dataGraph: NamedNode
}

const { serverMode } = useShui()

defineProps<Props>()
</script>

<template>
  <template v-if="serverMode">
    <AutoCompleteEditorRemote
      :term="term"
      :constraint-components="constraintComponents"
      :data-graph="dataGraph"
    />
  </template>
  <template v-else>
    <AutoCompleteEditorLocal
      :term="term"
      :constraint-components="constraintComponents"
      :data-graph="dataGraph"
    />
  </template>
</template>
