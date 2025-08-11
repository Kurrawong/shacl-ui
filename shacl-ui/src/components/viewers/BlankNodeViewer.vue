<script setup lang="ts">
import type { BlankNode } from '@rdfjs/types'

defineProps<{
  term: BlankNode
}>()
</script>

<template>
  <code class="text-sm">_:{{ term.value }}</code>
</template>
