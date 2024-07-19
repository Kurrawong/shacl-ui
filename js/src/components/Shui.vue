<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import n3, { DataFactory } from 'n3'

import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'

import { useShui } from '@/composables/shui'
import type { DropdownOption } from '@/types'
import FocusNode from '@/components/FocusNode.vue'

const { namedNode, blankNode, quad } = DataFactory

type GraphName = {
  value: string
  termType: 'NamedNode' | 'BlankNode'
}
interface Props {
  dataStr: string
  graphName: GraphName
}
const { dataStr, graphName } = defineProps<Props>()
const { shui, addQuads, parse, reset } = useShui()
onMounted(() => {
  reset()
  parse(dataStr)

  if (!selectedFocusNode.value && nodes.value.length === 1) {
    selectedFocusNode.value = nodes.value[0]
  }
})

const toGraph = (graphName: GraphName) => {
  if (graphName.termType === 'NamedNode') {
    return shui.value.toSNamedNode(namedNode(graphName.value))
  }
  return shui.value.toSBlankNode(blankNode(graphName.value))
}
let graph = toGraph(graphName)
const count = ref(0)

const handleClick = () => {
  count.value += 1

  if (!selectedFocusNode.value) {
    return
  }

  const focusNode = selectedFocusNode.value.codeTerm
  if (focusNode.termType !== 'NamedNode' && focusNode.termType !== 'BlankNode') {
    throw Error('Assert failed. Focus node must be a NamedNode or a BlankNode.')
  }
  if (graph.termType !== 'NamedNode' && graph.termType !== 'BlankNode') {
    throw Error('Assert failed. Focus node must be a NamedNode or a BlankNode.')
  }
  addQuads([quad(focusNode, namedNode('urn:predicate'), blankNode(`b${count.value}`), graph)])
}

const writer = new n3.Writer()
const rdfStr = computed(() => {
  return writer.quadsToString(shui.value.store.getQuads(null, null, null, graph))
})

const selectedFocusNode = ref<DropdownOption | null>(null)
watch(selectedFocusNode, () => {
  selectedNodeShape.value = null
})
const nodes = computed(() => {
  const subjects = shui.value.store.getSubjects(null, null, graph)
  return subjects
    .filter((s) => (s.termType === 'NamedNode' ? s : null))
    .map((s) => {
      if (s.termType !== 'NamedNode') throw Error('Assert failed. Term must be a NamedNode.')

      const nameTerm = shui.value.nodeLabel(s)
      return {
        name: nameTerm.value,
        nameTerm: nameTerm,
        code: s.value,
        codeTerm: shui.value.toSNamedNode(s)
      }
    })
})

const selectedFocusNodeTerm = computed(() => {
  if (selectedFocusNode.value?.codeTerm.termType !== 'NamedNode') {
    return null
  }
  return shui.value.toSNamedNode(selectedFocusNode.value.codeTerm)
})

const selectedNodeShape = ref<DropdownOption | null>(null)
const nodeShapes = computed(() => {
  if (!selectedFocusNodeTerm.value) {
    return []
  }
  const values = shui.value.getNodeShapes(selectedFocusNodeTerm.value, graph)
  return values.map((s) => {
    if (s.termType !== 'NamedNode') throw Error('Assert failed. Term must be a NamedNode.')
    const nameTerm = shui.value.nodeLabel(s)
    return {
      name: nameTerm.value,
      nameTerm: nameTerm,
      code: s.value,
      codeTerm: s
    }
  })
})

const size = computed(() => shui.value.store.getQuads(null, null, null, graph).length)
</script>

<template>
  <div class="space-y-4">
    <p class="text-base font-bold">Developer controls</p>
    <Dropdown
      v-model="selectedFocusNode"
      :options="nodes"
      option-label="name"
      placeholder="Select a focus node"
    />
    <Dropdown
      v-model="selectedNodeShape"
      :options="nodeShapes"
      option-label="name"
      placeholder="Select a node shape"
    />
    <Button @click="handleClick" :disabled="!selectedFocusNode">Add statement</Button>
    <p>Number of statements: {{ size }}</p>

    <hr class="pb-4" />

    <FocusNode
      v-if="selectedFocusNodeTerm"
      :focus-node="selectedFocusNodeTerm"
      :node-shape="selectedNodeShape?.codeTerm"
      :data-graph="graph"
    />

    <div class="overflow-x-auto">
      <p class="text-base font-bold">Data</p>
      <pre>{{ rdfStr }}</pre>
    </div>
  </div>
</template>
