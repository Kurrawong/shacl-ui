<script setup lang="ts">
import type { Literal } from '@rdfjs/types'

defineProps<{
  term: Literal
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <div class="text-sm">{{ term.value }}</div>
    <div class="flex gap-1">
      <div v-if="term.language" class="text-xs text-gray-400">lang: {{ term.language }} |</div>
      <div class="text-xs text-gray-400">{{ term.datatype.value }}</div>
    </div>
  </div>
</template>
