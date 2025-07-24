<script setup lang="ts">
import { ref } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'
import type { AnyPointer } from 'clownface'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import { ChevronsUpDown } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import PropertyShape from '@/components/PropertyShape.vue'

const { propertyShapes, focusNode, dataGraph, validator, predicates } = defineProps<{
  propertyShapes: Shape[]
  focusNode: NamedNode | BlankNode
  dataGraph: AnyPointer
  validator: UISHACLValidator
  predicates: NamedNode[]
}>()
const isOpen = ref(true)
</script>

<template>
  <Collapsible v-model:open="isOpen" class="space-y-2">
    <div class="flex items-center justify-between space-x-4 border-b-1 border-gray-200">
      <h4 class="text-md font-semibold text-blue-900">Other Properties</h4>
      <CollapsibleTrigger as-child>
        <Button variant="ghost" size="sm" class="w-9 p-0">
          <ChevronsUpDown class="h-4 w-4" />
          <span class="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent class="space-y-2 bg-gray-50 p-4 rounded-md">
      <div v-for="propertyShape in propertyShapes" :key="propertyShape.shapeNode.value">
        <PropertyShape
          :property-shape="propertyShape"
          :focus-node="focusNode"
          :data-graph="dataGraph"
          :validator="validator"
        />
      </div>

      <div v-for="predicate in predicates" :key="predicate.value">
        <div class="text-sm text-gray-500">{{ predicate.value }}</div>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>
