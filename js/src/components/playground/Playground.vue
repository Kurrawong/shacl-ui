<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Dropdown from 'primevue/dropdown'
import FocusNode from '@/components/FocusNode.vue'
import { useShui } from '@/composables/shui'
import type { DropdownOption } from '@/types'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode
import DataPanel from '@/components/playground/DataPanel.vue'

const { shui } = useShui()
const graph = shui.value.toSNamedNode(namedNode('urn:graph:data'))
const selectedFocusNode = ref<DropdownOption | null>(null)
watch(selectedFocusNode, () => {
  selectedNodeShape.value = null
})
watch(shui, () => {
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
</script>

<template>
  <Splitter>
    <SplitterPanel>
      <div class="p-2 max-w-full">
        <div class="pb-3">
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
          <p>Statements: {{ shui.store.getQuads(null, null, null, graph).length }}</p>
        </div>

        <div class="space-y-4">
          <FocusNode
            v-if="selectedFocusNodeTerm"
            :focus-node="selectedFocusNodeTerm"
            :node-shape="selectedNodeShape?.codeTerm"
            :data-graph="graph"
          />
        </div>
      </div>
    </SplitterPanel>
    <SplitterPanel>
      <div class="px-4 pt-4 space-y-5">
        <DataPanel />
      </div>
    </SplitterPanel>
  </Splitter>
</template>
