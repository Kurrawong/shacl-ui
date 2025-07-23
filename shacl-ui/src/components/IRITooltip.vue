<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ExternalLink } from 'lucide-vue-next'

defineProps<{
  iri: string
}>()
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <a :href="iri" target="_blank" rel="noopener noreferrer" class="inline-block">
          <ExternalLink class="w-3 h-3" />
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>{{ iri }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
