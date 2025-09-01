<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import n3 from 'n3'
import { createResourceManager } from '@/composables/resource-manager'
import type { NamedNode } from '@rdfjs/types'
import ResourceShell from '@/components/ResourceShell.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import exampleData from '@/assets/data.ttl?raw'
import exampleShapes from '@/assets/vocpub.ttl?raw'
import { rdf, sh } from '@/core/namespaces'
import TermSet from '@rdfjs/term-set'
import NamedNodeCombobox from '@/components/NamedNodeCombobox.vue'

const parser = new n3.Parser({ blankNodePrefix: '' })

const inputData = ref(exampleData)
const inputShapes = ref(exampleShapes)
const inputDataError = ref('')
const inputShapesError = ref('')
const data = ref('')
const shapes = ref('')
const report = ref('')
const unselectedOption = { value: null, label: '--Unselected--' }
const focusNode = ref(unselectedOption)
const nodeShape = ref(unselectedOption)

const prefixes = {
  dash: 'http://datashapes.org/dash#',
  dcat: 'http://www.w3.org/ns/dcat#',
  dc: 'http://purl.org/dc/elements/1.1/',
  dcterms: 'http://purl.org/dc/terms/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  geo: 'http://www.opengis.net/ont/geosparql#',
  owl: 'http://www.w3.org/2002/07/owl#',
  prof: 'http://www.w3.org/ns/dx/prof/',
  prov: 'http://www.w3.org/ns/prov#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  schema: 'http://schema.org/',
  sh: 'http://www.w3.org/ns/shacl#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  skosxl: 'http://www.w3.org/2008/05/skos-xl#',
  sosa: 'http://www.w3.org/ns/sosa/',
  ssn: 'http://www.w3.org/ns/ssn/',
  time: 'http://www.w3.org/ns/time#',
  tosh: 'http://topbraid.org/tosh#',
  vann: 'http://purl.org/vocab/vann/',
  void: 'http://rdfs.org/ns/void#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
}

const { resetDataGraph, resetShapesGraph, dataGraphPointer, validator, dataGraph, shapesGraph } =
  createResourceManager()

function setDataGraph() {
  parser.parse(inputData.value)
  data.value = inputData.value
  resetDataGraph(data.value)
  inputDataError.value = ''
}

function setShapesGraph() {
  parser.parse(inputShapes.value)
  shapes.value = inputShapes.value
  resetShapesGraph(shapes.value)
  inputShapesError.value = ''
}

function handleDataBlur() {
  try {
    setDataGraph()
  } catch (error) {
    inputDataError.value = (error as Error).message
  }
}

function handleShapesBlur() {
  try {
    setShapesGraph()
  } catch (error) {
    inputShapesError.value = (error as Error).message
  }
}

async function validateData() {
  validator.value.validationEngine.initReport()

  const result = await validator.value.validate(dataGraphPointer.value)

  const writer = new n3.Writer({
    format: 'text/turtle',
    prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      sh: 'http://www.w3.org/ns/shacl#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
    },
  })
  writer.addQuads(Array.from(result.dataset))
  writer.end((err, result) => {
    if (err) {
      console.error(err)
    } else {
      report.value = result
    }
  })
}

watch(dataGraphPointer, () => {
  const writer = new n3.Writer({
    format: 'text/turtle',
    prefixes: prefixes,
  })
  writer.addQuads(Array.from(dataGraph.value))
  writer.end((err, result) => {
    if (err) {
      console.error(err)
    } else {
      inputData.value = result
    }
  })
  validateData()
})

onMounted(() => {
  validateData()
  setDataGraph()
  setShapesGraph()
})

const focusNodes = computed(() => {
  return [
    unselectedOption,
    ...Array.from(new TermSet(dataGraph.value.getSubjects(null, null, null)))
      .filter((term) => term.termType === 'NamedNode')
      .map((term) => ({
        value: term,
        label: term.value.split('#').at(-1)?.split('/').at(-1) ?? '',
      })),
  ]
})

const nodeShapes = computed(() => {
  return [
    unselectedOption,
    ...Array.from(new TermSet(shapesGraph.value.getSubjects(rdf.type, sh.NodeShape, null)))
      .filter((term) => term.termType === 'NamedNode')
      .map((term) => ({
        value: term,
        label: term.value.split('#').at(-1)?.split('/').at(-1) ?? '',
      })),
  ]
})

watch(focusNodes, () => {
  if (
    focusNode.value.value !== null &&
    focusNodes.value.filter((node) =>
      node.value?.equals(focusNode.value.value as unknown as NamedNode),
    ).length === 0
  ) {
    focusNode.value = unselectedOption
  }
})
</script>

<template>
  <div class="flex flex-row gap-4">
    <!-- left side -->
    <div class="w-1/2 space-y-4 flex flex-col h-[calc(100vh-2rem)]">
      <div class="overflow-y-auto space-y-3">
        <div class="space-y-2 pr-2">
          <h2 class="text-lg font-semibold">Validation Report</h2>
          <div class="overflow-y-auto border border-gray-300 rounded-md p-2">
            <pre class="text-sm max-h-[32vh]">{{ report }}</pre>
          </div>
        </div>

        <div class="space-y-2 pr-2">
          <h2 class="text-lg font-semibold">Data Graph</h2>
          <Textarea
            v-model="inputData"
            @blur="handleDataBlur"
            class="h-[32vh]"
            :class="inputDataError ? 'border-red-600 focus-visible:ring-red-300' : ''"
          />
          <div v-if="inputDataError" class="text-sm text-red-600">{{ inputDataError }}</div>
        </div>

        <div class="space-y-2 pr-2">
          <h2 class="text-lg font-semibold">Shapes Graph</h2>
          <Textarea
            v-model="inputShapes"
            @blur="handleShapesBlur"
            class="h-[32vh]"
            :class="inputShapesError ? 'border-red-600 focus-visible:ring-red-300' : ''"
          />
          <div v-if="inputShapesError" class="text-sm text-red-600">{{ inputShapesError }}</div>
        </div>
      </div>
    </div>

    <!-- right side -->
    <div class="w-1/2 flex flex-row h-[calc(100vh-2rem)]">
      <div class="overflow-y-auto w-full">
        <div class="flex flex-row gap-2">
          <NamedNodeCombobox v-model="focusNode" :values="focusNodes" label="focus node" />
          <NamedNodeCombobox v-model="nodeShape" :values="nodeShapes" label="node shape" />
        </div>
        <ResourceShell
          v-if="focusNode.value !== null"
          :focus-node="focusNode.value"
          :node-shape="nodeShape.value"
        />
      </div>
    </div>
  </div>
</template>
