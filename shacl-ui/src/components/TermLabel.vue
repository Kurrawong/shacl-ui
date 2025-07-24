<script setup lang="ts">
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import IRITooltip from '@/components/IRITooltip.vue'

defineProps<{
  term: NamedNode | BlankNode | Literal
}>()
</script>

<template>
  <div v-if="term.termType === 'NamedNode'" class="text-xl text-gray-900">
    <{{ term.value }}> <IRITooltip :iri="term.value" />
  </div>
  <div v-else-if="term.termType === 'BlankNode'" class="text-xl text-gray-900">
    _:{{ term.value }}
  </div>
  <div v-else-if="term.termType === 'Literal'" class="text-xl text-gray-900">{{ term.value }}</div>
</template>
