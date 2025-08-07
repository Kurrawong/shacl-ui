<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'
import PredicatePathLabel from '@/components/PredicatePathLabel.vue'
import PropertyPathBase from '@/components/PropertyPathBase.vue'
import type { Shape } from 'rdf-validate-shacl/src/shapes-graph'
import ValueNode from '@/components/ValueNode.vue'
import AddNewValueNode from '@/components/AddNewValueNode.vue'
import { getSHOrDatatypes } from '@/core/widgets'
import TermSet from '@rdfjs/term-set'
import { sh } from '@/core/namespaces'
import n3 from 'n3'
import { useFocusNodeContext } from '@/composables/focus-node'
import { useResourceManagerContext } from '@/composables/resource-manager'

const { quad } = n3.DataFactory

const props = defineProps<{
  path: NamedNode
  pathLabel: string
  valueNodes: (NamedNode | BlankNode)[]
  propertyShape?: Shape
}>()

const { focusNode } = useFocusNodeContext()
const { addQuad } = useResourceManagerContext()

const _valueNodes = ref<(NamedNode | BlankNode)[]>([...props.valueNodes])

watch(
  () => props.valueNodes,
  (newVal) => {
    _valueNodes.value = [...newVal]
  },
)

const addNewValue = (value: NamedNode | BlankNode) => {
  if (value.termType === 'BlankNode') {
    addQuad(quad(value, props.path, focusNode.value))
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
    <template #path-type> inverse </template>
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
            :path="path"
            :value-node="valueNode"
            :property-shape="propertyShape"
            :inverse="true"
          />
        </div>

        <div class="flex justify-end">
          <AddNewValueNode @add-new-value="addNewValue" :datatypes="datatypes" />
        </div>
      </div>
    </template>
  </PropertyPathBase>
</template>
