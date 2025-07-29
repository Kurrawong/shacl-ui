<script setup lang="ts">
import type { NamedNode, BlankNode, DatasetCore, Literal } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import PropertyShape from '@/components/PropertyShape.vue'
import PropertyGroupBase from '@/components/PropertyGroupBase.vue'
import PredicatePath from '@/components/PredicatePath.vue'

defineProps<{
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

      <template v-for="predicate in predicates" :key="predicate.value">
        <PredicatePath
          :focus-node="focusNode"
          :path="predicate"
          :path-type="'predicate'"
          :path-label="predicate.value.split('#').slice(-1)[0].split('/').slice(-1)[0]"
          :value-nodes="
            Array.from(dataGraph.match(focusNode, predicate, null))
              .map((quad) => quad.object as NamedNode | BlankNode | Literal)
              .sort((a, b) => a.value.localeCompare(b.value))
          "
          :data-graph="dataGraph"
          :validator="validator"
        />
      </template>
    </template>
  </PropertyGroupBase>
</template>
