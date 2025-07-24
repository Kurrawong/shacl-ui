<script setup lang="ts">
import { computed, ref } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { ChevronsUpDown } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { sh } from '@/lib/namespaces'

export type PropertyGroupType = {
  term: NamedNode | BlankNode
  order: number | null
  labels: Literal[]
  propertyShapes: Shape[]
}

const { labels, term, propertyShapes } = defineProps<PropertyGroupType>()
const isOpen = ref(true)
const propertyGroupLabel = computed(() => {
  // TODO: preference language tag, then no language tag, then first label
  return labels[0]?.value || term.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
})
</script>

<template>
  <Collapsible v-model:open="isOpen" class="space-y-2">
    <div class="flex items-center justify-between space-x-4 px-4">
      <h4 class="text-md font-semibold text-blue-900">{{ propertyGroupLabel }}</h4>
      <CollapsibleTrigger as-child>
        <Button variant="ghost" size="sm" class="w-9 p-0">
          <ChevronsUpDown class="h-4 w-4" />
          <span class="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent class="space-y-2">
      <div v-for="propertyShape in propertyShapes" :key="propertyShape.shapeNode.value">
        <div class="text-sm text-gray-500">
          {{ propertyShape.shapeNodePointer.term.value }}
          {{ propertyShape.shapeNodePointer.out(sh.order).term?.value }}
        </div>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>
