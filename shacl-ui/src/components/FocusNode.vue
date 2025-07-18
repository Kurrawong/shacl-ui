<script setup lang="ts">
import type { UITree } from '@/types'
import n3 from 'n3'
import PropertyGroup from './PropertyGroup.vue'

const props = withDefaults(
  defineProps<{
    uiTree: UITree
    dataGraph: n3.Store
    shapesGraph: n3.Store
    isRootNode?: boolean
  }>(),
  {
    isRootNode: false,
  },
)
</script>

<template>
  <div class="text-xl text-gray-900">Untitled</div>
  <div v-if="props.isRootNode">
    IRI: <code class="text-sm">{{ uiTree.focusNode.value }}</code>
  </div>

  <div>
    <div
      v-for="propertyGroup in uiTree.propertyGroups"
      :key="propertyGroup.term.value"
      class="mb-4"
    >
      <PropertyGroup
        :propertyGroup="propertyGroup"
        :uiTree="uiTree"
        :dataGraph="dataGraph"
        :shapesGraph="shapesGraph"
      />
    </div>
  </div>
</template>
