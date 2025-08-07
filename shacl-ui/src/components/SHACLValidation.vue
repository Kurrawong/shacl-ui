<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { NamedNode, BlankNode } from '@rdfjs/types'
import { PrefixMapFactory } from 'rdf-ext'
import n3 from 'n3'
import FocusNode from '@/components/FocusNode.vue'
import { useFocusNodeContext } from '@/composables/focus-node'
import { useResourceManagerContext } from '@/composables/resource-manager'
import Serializer from '@rdfjs/serializer-turtle'

const { namedNode } = n3.DataFactory

const props = defineProps<{
  nodeShape: NamedNode | BlankNode | null
}>()

const { focusNode } = useFocusNodeContext()
const { dataGraph, dataGraphPointer, validator } = useResourceManagerContext()
const dataGraphString = ref('')
const report = ref('')

onMounted(() => {
  validateData()
  setDataGraphString()
})

watch(
  dataGraphPointer,
  () => {
    validateData()
    setDataGraphString()
  },
  { deep: true },
)

async function validateData() {
  validator.value.validationEngine.initReport()

  if (!props.nodeShape) {
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

function setDataGraphString() {
  const serializer = new Serializer()
  const result = serializer.transform(Array.from(dataGraph.value))
  dataGraphString.value = result
}
</script>

<template>
  <FocusNode
    :focus-node="focusNode"
    :node-shape="nodeShape"
  />

  <h3 class="text-lg font-bold">Report</h3>

  <pre v-if="report" class="text-sm text-gray-800 bg-gray-100 p-2 rounded-md"
    >{{ report }}
  </pre>

  <h3 class="text-lg font-bold">Data Graph</h3>

  <pre v-if="dataGraphString" class="text-sm text-gray-800 bg-gray-100 p-2 rounded-md"
    >{{ dataGraphString }}
  </pre>
</template>
