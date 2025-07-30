<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NamedNode, BlankNode, Literal, DatasetCore } from '@rdfjs/types'
import type { UISHACLValidator } from '@/lib/shapes-graph'
import PredicatePathLabel from '@/components/PredicatePathLabel.vue'
import PropertyPathBase from '@/components/PropertyPathBase.vue'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import ValueNode from '@/components/ValueNode.vue'
import AddNewValueNode from '@/components/AddNewValueNode.vue'

export type PathType = 'predicate' | 'inverse' | 'alternative' | null

const props = defineProps<{
  focusNode: NamedNode | BlankNode
  path: NamedNode
  pathType: PathType
  pathLabel: string
  valueNodes: (NamedNode | BlankNode | Literal)[]
  dataGraph: DatasetCore
  validator: UISHACLValidator
  propertyShape?: Shape
}>()

const _valueNodes = ref<(NamedNode | BlankNode | Literal)[]>([...props.valueNodes])

watch(
  () => props.valueNodes,
  (newVal) => {
    _valueNodes.value = [...newVal]
  },
)

const addNewValue = (value: NamedNode | Literal) => {
  _valueNodes.value.push(value)
}

// TODO: adding new value nodes depends on the cardinality constraints present on the property shape.
</script>

<template>
  <PropertyPathBase>
    <template #path-type> predicate </template>
    <template #path-label>
      <PredicatePathLabel :label="pathLabel" :predicate-path="path" />
    </template>
    <template #value-nodes>
      <div
        v-if="_valueNodes.length === 0"
        class="text-sm text-gray-400 italic flex justify-between items-center"
      >
        No values

        <AddNewValueNode @add-new-value="addNewValue" />
      </div>

      <div v-else class="space-y-1">
        <div v-for="valueNode in _valueNodes" :key="valueNode.value">
          <ValueNode
            :focus-node="focusNode"
            :path="path"
            :value-node="valueNode"
            :data-graph="dataGraph"
            :validator="validator"
            :property-shape="propertyShape"
          />
        </div>

        <div class="flex justify-end">
          <AddNewValueNode @add-new-value="addNewValue" />
        </div>
      </div>
    </template>
  </PropertyPathBase>
</template>
