<script setup lang="ts">
import { ref, watch, computed, inject } from 'vue'
import type { NamedNode, BlankNode, Literal, DatasetCore } from '@rdfjs/types'
import type { UISHACLValidator } from '@/core/shapes-graph'
import PredicatePathLabel from '@/components/PredicatePathLabel.vue'
import PropertyPathBase from '@/components/PropertyPathBase.vue'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import ValueNode from '@/components/ValueNode.vue'
import AddNewValueNode from '@/components/AddNewValueNode.vue'
import { getSHOrDatatypes } from '@/core/widgets'
import TermSet from '@rdfjs/term-set'
import { sh } from '@/core/namespaces'
import n3 from 'n3'

const { quad } = n3.DataFactory

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

const { addQuad } = inject<{
  addQuad: (quad: n3.Quad) => void
  deleteQuad: (quad: n3.Quad) => void
}>('DataStoreActions')!

const addNewValue = (value: NamedNode | BlankNode | Literal) => {
  if (value.termType === 'BlankNode') {
    addQuad(quad(props.focusNode, props.path, value))
  } else {
    _valueNodes.value.push(value)
  }
}

// TODO: adding new value nodes depends on the cardinality constraints present on the property shape.

const datatypes = computed(() => {
  const datatype = props.propertyShape?.shapeNodePointer.out(sh.datatype).term
  let datatypesSet = new TermSet<NamedNode>()

  if (props.propertyShape) {
    datatypesSet = getSHOrDatatypes(props.propertyShape)
  }

  if (datatype && datatype.termType === 'NamedNode') {
    datatypesSet.add(datatype)
  }

  return datatypesSet
})
</script>

<template>
  <PropertyPathBase>
    <template #path-label>
      <PredicatePathLabel :label="pathLabel" :predicate-path="path" />
    </template>
    <template #value-nodes>
      <div
        v-if="_valueNodes.length === 0"
        class="text-sm text-gray-400 italic flex justify-between items-center"
      >
        No values

        <AddNewValueNode @add-new-value="addNewValue" :datatypes="datatypes" />
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
          <AddNewValueNode @add-new-value="addNewValue" :datatypes="datatypes" />
        </div>
      </div>
    </template>
  </PropertyPathBase>
</template>
