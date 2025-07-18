<script setup lang="ts">
import { ref } from 'vue'
import { Collapsible } from '@/components/ui/collapsible'
import { CollapsibleTrigger } from '@/components/ui/collapsible'
import { CollapsibleContent } from '@/components/ui/collapsible'
import PropertyPath from '@/components/PropertyPath.vue'
import type { PropertyGroup, UITree } from '@/types'
import n3 from 'n3'

const props = withDefaults(
  defineProps<{
    propertyGroup: PropertyGroup
    uiTree: UITree
    dataGraph: n3.Store
    shapesGraph: n3.Store
    isOpen?: boolean
  }>(),
  {
    isOpen: true,
  },
)

const isOpen = ref(props.isOpen)
</script>

<template>
  <Collapsible v-model:open="isOpen">
    <CollapsibleTrigger
      class="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border"
    >
      <h3 class="font-medium text-gray-900">
        {{ propertyGroup.labels[0]?.value || propertyGroup.term.value }}
      </h3>
      <svg
        class="w-4 h-4 text-gray-600 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </CollapsibleTrigger>

    <CollapsibleContent class="mt-2 p-3 border border-gray-200 rounded-lg bg-white">
      <div v-if="propertyGroup.propertyPaths.length > 0">
        <div
          v-for="predicate in propertyGroup.propertyPaths"
          :key="predicate.value"
          class="mb-2 p-2 bg-gray-50 rounded"
        >
          <PropertyPath
            :property-path-key="predicate.value"
            :ui-tree="uiTree"
            :data-graph="dataGraph"
            :shapes-graph="shapesGraph"
          />
        </div>
      </div>
      <div v-else class="text-sm text-gray-500 italic">No predicates in this group</div>
    </CollapsibleContent>
  </Collapsible>
</template>
