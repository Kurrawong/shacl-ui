<script setup lang="ts">
import type { NamedNode } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import PropertyShape from '@/components/PropertyShape.vue'
import PropertyGroupBase from '@/components/PropertyGroupBase.vue'
import PredicatePathWrapper from '@/components/PredicatePathWrapper.vue'

defineProps<{
  propertyShapes: Shape[]
  predicates: NamedNode[]
}>()
</script>

<template>
  <PropertyGroupBase>
    <template #title>Other Properties</template>
    <template #content>
      <div v-for="propertyShape in propertyShapes" :key="propertyShape.shapeNode.value">
        <PropertyShape :property-shape="propertyShape" />
      </div>

      <template v-for="predicate in predicates" :key="predicate.value">
        <PredicatePathWrapper :path="predicate" />
      </template>
    </template>
  </PropertyGroupBase>
</template>
