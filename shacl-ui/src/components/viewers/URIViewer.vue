<script setup lang="ts">
import type { NamedNode } from '@rdfjs/types'

defineProps<{
  term: NamedNode
}>()
</script>

<template>
  <!-- TODO: emit click to open resource either in a new tab, in current window, or in a nested window -->
  <code class="text-xs">&lt;{{ term.value }}&gt;</code>
</template>
