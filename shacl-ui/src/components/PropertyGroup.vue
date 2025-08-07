<script setup lang="ts">
import { computed } from 'vue'
import type { NamedNode, BlankNode, Literal } from '@rdfjs/types'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import PropertyShape from '@/components/PropertyShape.vue'
import PropertyGroupBase from '@/components/PropertyGroupBase.vue'

export type PropertyGroupType = {
  term: NamedNode | BlankNode | null
  order: number | null
  labels: Literal[]
  propertyShapes: Shape[]
}

const props = defineProps<PropertyGroupType>()
const propertyGroupLabel = computed(() => {
  // TODO: preference language tag, then no language tag, then first label
  return props.labels[0]?.value || props.term?.value.split('#').slice(-1)[0].split('/').slice(-1)[0]
})
</script>

<template>
  <PropertyGroupBase>
    <template #title>
      {{ propertyGroupLabel }}
    </template>

    <template #content>
      <div v-for="propertyShape in propertyShapes" :key="propertyShape.shapeNode.value">
        <PropertyShape :property-shape="propertyShape" />
      </div>
    </template>
  </PropertyGroupBase>
</template>
