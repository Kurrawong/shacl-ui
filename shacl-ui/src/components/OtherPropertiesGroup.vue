<script setup lang="ts">
import type { NamedNode, BlankNode, DatasetCore } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import PropertyShape from '@/components/PropertyShape.vue'
import PropertyGroupBase from '@/components/PropertyGroupBase.vue'

const { propertyShapes, focusNode, dataGraph, validator, predicates } = defineProps<{
  propertyShapes: Shape[]
  focusNode: NamedNode | BlankNode
  dataGraph: DatasetCore
  validator: UISHACLValidator
  predicates: NamedNode[]
}>()
</script>

<template>
  <PropertyGroupBase>
    <template #title>Other Properties</template>
    <template #content>
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
    </template>
  </PropertyGroupBase>
</template>
