<script setup lang="ts">
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { AnyPointer } from 'clownface'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import PredicatePathLabel from '@/components/PredicatePathLabel.vue'
import PropertyPathBase from '@/components/PropertyPathBase.vue'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import ValueNode from '@/components/ValueNode.vue'

export type PathType = 'predicate' | 'inverse' | 'alternative' | null

const { path, valueNodes, dataGraph, validator } = defineProps<{
  focusNode: NamedNode | BlankNode
  path: NamedNode
  pathType: PathType
  pathLabel: string
  valueNodes: (NamedNode | BlankNode | Literal)[]
  dataGraph: AnyPointer
  validator: UISHACLValidator
  propertyShape?: Shape
}>()
</script>

<template>
  <PropertyPathBase>
    <template #path-type> predicate </template>
    <template #path-label>
      <PredicatePathLabel :label="pathLabel" :predicate-path="path" />
    </template>
    <template #value-nodes>
      <div v-if="valueNodes.length === 0" class="text-sm text-gray-400 italic">No values</div>

      <div v-else>
        <div v-for="valueNode in valueNodes" :key="valueNode.value">
          <ValueNode
            :focus-node="focusNode"
            :path="path"
            :value-node="valueNode"
            :data-graph="dataGraph"
            :validator="validator"
            :property-shape="propertyShape"
          />
        </div>
      </div>

      <!-- <div v-else class="space-y-2">
        <div v-for="valueNode in valueNodes" :key="valueNode.value" class="flex items-center gap-2">
          <input
            type="text"
            :value="valueNode.value"
            class="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            readonly
          />
        </div>
      </div> -->
    </template>
  </PropertyPathBase>
</template>
