<script setup lang="ts">
import { toRef } from 'vue'
import type { BlankNode, NamedNode } from '@rdfjs/types'

import PredicateObjectValues from '@/components/PredicateObjectValues.vue'
import { SBlankNode, type SNamedNode } from '@/shui'
import type { PredicateConstraints } from '@/types'

interface Props {
  focusNode: SNamedNode | SBlankNode
  dataGraph: SNamedNode | SBlankNode
  predicateObjectValues: PredicateConstraints[]
  groupFilter: NamedNode | BlankNode | null
}

const props = defineProps<Props>()
const predicateObjectValues = toRef(props, 'predicateObjectValues')

function filterPredicateObjectValuesByGroup(group: NamedNode | BlankNode | null) {
  if (group === null) {
    return predicateObjectValues.value.filter((value) => value.group === null)
  }
  return predicateObjectValues.value.filter((value) => value.group?.equals(group))
}
</script>

<template>
  <template
    v-for="(predicateObject, index) in filterPredicateObjectValuesByGroup(groupFilter)"
    :key="predicateObject.term.id"
  >
    <PredicateObjectValues
      :focus-node="focusNode"
      :data-graph="dataGraph"
      :predicate-object="predicateObject"
    />

    <hr v-if="index !== filterPredicateObjectValuesByGroup(groupFilter).length - 1" class="py-2" />
  </template>
</template>
