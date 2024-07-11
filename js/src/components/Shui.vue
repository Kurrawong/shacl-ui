<script setup lang="ts">
import {computed, type ComputedRef, onMounted, ref} from 'vue'
import n3, { DataFactory } from 'n3'

import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'

import { useShui } from '@/composables/shui'
import Resource from '@/components/Resource.vue'
import type { DropdownOption } from '@/types'
import blankNode = DataFactory.blankNode;

const { namedNode, quad } = DataFactory

interface Props {
  dataStr: string
}
const { dataStr } = defineProps<Props>()
const { shui, addQuads, parse, reset } = useShui()
onMounted(() => {
  reset()
  parse(dataStr)
})
// TODO: Handle hardcoded
const graph = shui.value.toSNamedNode(namedNode('urn:graph:data'))
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
  addQuads([
    quad(focusNode, namedNode('urn:predicate'), blankNode(`b${count.value}`), graph)
  ])
}

const writer = new n3.Writer()
const rdfStr = computed(() => {
  return writer.quadsToString(shui.value.store.getQuads(null, null, null, graph))
})

const selectedFocusNode = ref<DropdownOption | null>(null)
const nodes: ComputedRef<DropdownOption[]> = computed(() => {
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
        codeTerm: s
      }
    })
})

const selectedFocusNodeTerm = computed(() => {
  if (selectedFocusNode.value?.codeTerm.termType !== 'NamedNode') {
    throw Error('Assert failed. Selected focus node must be a NamedNode.')
  }
  return shui.value.toSNamedNode(selectedFocusNode.value.codeTerm)
})
</script>

<template>
  <div class="space-y-4">
    <p class="text-base font-bold">Developer controls</p>
    <Dropdown v-model="selectedFocusNode" :options="nodes" option-label="name" placeholder="Select a focus node" />
    <Button @click="handleClick" :disabled="!selectedFocusNode">Add statement</Button>
    <p>Selected focus node: {{ selectedFocusNode?.codeTerm.value }}</p>
    <p>Number of statements: {{ shui.store.size }}</p>

    <hr class="pb-4" />

    <Resource v-if="selectedFocusNode" :subject="selectedFocusNodeTerm" :graph="graph" />

    <div class="overflow-x-auto">
      <p class="text-base font-bold">Data</p>
      <pre>{{ rdfStr }}</pre>
    </div>
  </div>
</template>
