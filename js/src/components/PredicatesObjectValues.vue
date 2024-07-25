<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { BlankNode, NamedNode } from '@rdfjs/types'

import PredicateObjectValues from '@/components/PredicateObjectValues.vue'
import { SBlankNode, type SNamedNode } from '@/shui'
import type { PredicateConstraints } from '@/types'
import AddNewPredicate from '@/components/AddNewPredicate.vue'

interface Props {
  focusNode: SNamedNode | SBlankNode
  dataGraph: SNamedNode | SBlankNode
  predicateObjectValues: PredicateConstraints[]
  groupFilter: NamedNode | BlankNode | null
}

const props = defineProps<Props>()
const predicateObjectValues = toRef(props, 'predicateObjectValues')
const groupFilter = toRef(props, 'groupFilter')

const filteredPredicatesObjectValues = computed(() => {
  const group = groupFilter.value
  if (group === null) {
    return predicateObjectValues.value.filter((value) => value.group === null)
  }
  return predicateObjectValues.value.filter((value) => value.group?.equals(group))
})
</script>

<template>
  <template
    v-for="(predicateObject, index) in filteredPredicatesObjectValues"
    :key="predicateObject.term.id"
  >
    <PredicateObjectValues
      :focus-node="focusNode"
      :data-graph="dataGraph"
      :predicate-object="predicateObject"
    />

    <hr v-if="index !== filteredPredicatesObjectValues.length - 1" class="py-2" />
  </template>

  <div>
    <hr class="pb-4" />
    <AddNewPredicate :predicate-object-values="predicateObjectValues" />
  </div>
</template>
