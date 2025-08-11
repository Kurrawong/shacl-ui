<script setup lang="ts">
import type { Literal } from '@rdfjs/types'
import { ExternalLink } from 'lucide-vue-next'

defineProps<{
  term: Literal
}>()
</script>

<template>
  <a
    :href="term.value"
    class="text-sm text-blue-500 hover:underline flex items-center gap-1"
    target="_blank"
  >
    {{ term.value }}

    <ExternalLink class="w-3 h-3" />
  </a>
</template>
