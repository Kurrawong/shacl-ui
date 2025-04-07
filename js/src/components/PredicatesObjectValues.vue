<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { BlankNode, NamedNode } from '@rdfjs/types'

import PredicateObjectValues from '@/components/PredicateObjectValues.vue'
import { SBlankNode, type SNamedNode } from '@/core/shui'
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

const orderedPredicateObjectValues = computed(() => {
  const objectValues = [...filteredPredicatesObjectValues.value]
  return objectValues.sort((a, b) => {
    if (a.order < b.order) {
      return -1
    }
    if (a.order > b.order) {
      return 1
    }
    return 0
  })
})
</script>

<template>
  <template
    v-for="(predicateObject, index) in orderedPredicateObjectValues"
    :key="predicateObject.term.id"
  >
    <PredicateObjectValues
      :focus-node="focusNode"
      :data-graph="dataGraph"
      :predicate-object="predicateObject"
    />

    <hr v-if="index !== orderedPredicateObjectValues.length - 1" class="py-2" />
  </template>

  <!-- Only render this on the 'Other Properties' group -->
  <div v-if="groupFilter === null">
    <hr class="pb-4" />
    <AddNewPredicate :predicate-object-values="predicateObjectValues" />
  </div>
</template>
