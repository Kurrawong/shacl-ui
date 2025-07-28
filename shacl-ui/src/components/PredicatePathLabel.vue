<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { NamedNode } from '@rdfjs/types'
import { ExternalLink } from 'lucide-vue-next'

defineProps<{
  label: string
  predicatePath: NamedNode
}>()
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <a
          :href="predicatePath.value"
          target="_blank"
          class="underline inline-flex items-center gap-1 text-gray-800"
          tabindex="-1"
        >
          {{ label }}
          <ExternalLink class="w-3 h-3" />
        </a>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{{ predicatePath.value }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
