<script setup lang="ts">
import { onMounted, ref, watch, computed, provide } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'
import Serializer from '@rdfjs/serializer-turtle'
import { PrefixMapFactory } from 'rdf-ext'
import n3 from 'n3'
import { useStore } from '@/composables/store'
import FocusNode from '@/components/FocusNode.vue'
import { UISHACLValidator } from '@/core/shapes-graph'

const { namedNode } = n3.DataFactory

const props = withDefaults(
  defineProps<{
    focusNode: NamedNode | BlankNode
    dataGraph: string
    shapesGraph: string
    nodeShape: NamedNode | BlankNode | null
    isRootNode?: boolean
  }>(),
  {
    isRootNode: false,
  },
)

const { focusNode, nodeShape } = props

const { store: dataGraph, addQuad, deleteQuad } = useStore(props.dataGraph)
const { store: shapesGraph } = useStore(props.shapesGraph)

provide<{ addQuad: (quad: n3.Quad) => void; deleteQuad: (quad: n3.Quad) => void }>(
  'DataStoreActions',
  {
    addQuad,
    deleteQuad,
  },
)

const validator = computed(() => new UISHACLValidator(shapesGraph.value))
const dataGraphPointer = computed(() =>
  validator.value.factory.clownface({ dataset: dataGraph.value }),
)

const report = ref('')

const validateData = async () => {
  validator.value.validationEngine.initReport()

  if (!nodeShape) {
    return
  }

  const result = await validator.value.validate(dataGraphPointer.value)

  const prefixes = new PrefixMapFactory().prefixMap([
    ['sh', namedNode('http://www.w3.org/ns/shacl#')],
  ])
  const serializer = new Serializer({ prefixes })
  const resultString = serializer.transform(Array.from(result.dataset))
  report.value = resultString
}

const setDataGraphString = () => {
  const serializer = new Serializer()
  const result = serializer.transform(Array.from(dataGraph.value))
  dataGraphString.value = result
}

onMounted(() => {
  validateData()
  setDataGraphString()
})

const dataGraphString = ref('')

watch(
  dataGraphPointer,
  () => {
    validateData()
    setDataGraphString()
  },
  { deep: true },
)
</script>

<template>
  <pre v-if="report" class="text-sm text-gray-800"
    >{{ report }}
  </pre>

  <FocusNode
    :focus-node="focusNode"
    :node-shape="nodeShape"
    :data-graph="dataGraph"
    :validator="validator"
    :is-root-node="true"
  />

  <pre v-if="dataGraphString" class="text-sm text-gray-800"
    >{{ dataGraphString }}
  </pre>
</template>
