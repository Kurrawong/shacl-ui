<script setup lang="ts">
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'

const { label } = defineProps<{
  label: NamedNode | BlankNode | Literal
}>()
</script>

<template>
  <h1 v-if="label.termType === 'NamedNode'" class="text-2xl font-bold text-blue-900">
    {{ label.value.split('#').slice(-1)[0].split('/').slice(-1)[0] }}
  </h1>
  <h1 v-else-if="label.termType === 'BlankNode'" class="text-2xl font-bold text-blue-900">
    {{ label.value }}
  </h1>
  <h1
    v-else-if="label.termType === 'Literal' && label.language"
    class="text-2xl font-bold text-blue-900"
  >
    {{ label.value }}
    <span class="text-xs font-medium text-gray-400 align-super">(lang: {{ label.language }})</span>
  </h1>
  <h1
    v-else-if="label.termType === 'Literal' && !label.language"
    class="text-2xl font-bold text-blue-900"
  >
    {{ label.value }}
    <span class="text-xs font-medium text-gray-400 align-super">({{ label.datatype.value }})</span>
  </h1>
</template>
