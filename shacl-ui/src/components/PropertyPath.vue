<script setup lang="ts">
import { computed } from 'vue'
import type { UITree } from '@/types'
import n3 from 'n3'

const { propertyPathKey, uiTree, dataGraph, shapesGraph } = defineProps<{
  propertyPathKey: string
  uiTree: UITree
  dataGraph: n3.Store
  shapesGraph: n3.Store
}>()

const label = computed(() => {
  if (uiTree.propertyPaths[propertyPathKey].labels.length > 0) {
    return uiTree.propertyPaths[propertyPathKey].labels[0].value
  }
  return uiTree.propertyPaths[propertyPathKey].term.value
})

const focusNode = uiTree.focusNode
const valueNodes = computed(() => {
  return dataGraph.getObjects(focusNode, uiTree.propertyPaths[propertyPathKey].term, null)
})
</script>

<template>
  <div>
    <div class="text-sm font-mono text-gray-700">
      {{ label }}
    </div>
    <div v-if="valueNodes.length" class="text-xs text-gray-500">
      <div v-for="valueNode in valueNodes" :key="valueNode.value" class="flex items-center gap-2">
        <div class="text-xs text-gray-500">
          {{ valueNode.value }}
        </div>
        <div
          v-if="valueNode.termType === 'Literal' && valueNode.language"
          class="text-xs text-gray-500"
        >
          @{{ valueNode.language }}
        </div>
        <div
          v-if="valueNode.termType === 'Literal' && valueNode.datatype"
          class="text-xs text-gray-500"
        >
          {{ valueNode.datatype.value }}
        </div>
      </div>
    </div>
  </div>
</template>
