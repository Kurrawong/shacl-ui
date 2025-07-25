<script setup lang="ts">
import { computed } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'
import type { AnyPointer } from 'clownface'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import { sh } from '@/lib/namespaces'
import PredicatePathLabel from '@/components/PredicatePathLabel.vue'
import PropertyPathBase from '@/components/PropertyPathBase.vue'

const { propertyShape, focusNode, dataGraph } = defineProps<{
  propertyShape: Shape
  focusNode: NamedNode | BlankNode
  dataGraph: AnyPointer
  validator: UISHACLValidator
}>()

const path = computed(() => {
  return propertyShape.path?.term as NamedNode
})

const pathLabel = computed(() => {
  const shName = propertyShape.shapeNodePointer.out(sh`name`).terms
  if (shName.length) {
    // TODO: preference language tag, then no language tag, then first label
    return shName[0].value
  }

  // TODO: labels graph?

  return propertyShape.shapeNodePointer.term.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
})

const valueNodes = computed(() => {
  return dataGraph.node(focusNode).out(propertyShape.path).terms
})
</script>

<template>
  <PropertyPathBase>
    <template #path-type> predicate </template>
    <template #path-label>
      <PredicatePathLabel :label="pathLabel" :predicate-path="path" />
    </template>
    <template #value-nodes>
      <div v-if="valueNodes.length === 0" class="text-sm text-gray-400 italic">No values</div>
      <div v-else class="space-y-2">
        <div v-for="valueNode in valueNodes" :key="valueNode.value" class="flex items-center gap-2">
          <input
            type="text"
            :value="valueNode.value"
            class="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readonly
          />
        </div>
      </div>
    </template>
  </PropertyPathBase>
</template>
