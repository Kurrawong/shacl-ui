<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import n3 from 'n3'
import { provideResourceManager } from '@/composables/resource-manager'
import ResourceShell from '@/components/ResourceShell.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { PrefixMapFactory } from 'rdf-ext'
import Serializer from '@rdfjs/serializer-turtle'
import exampleData from '@/assets/data.ttl?raw'
import exampleShapes from '@/assets/vocpub.ttl?raw'
import { rdf, sh } from '@/core/namespaces'

const parser = new n3.Parser({ blankNodePrefix: '' })
const { namedNode } = n3.DataFactory

const inputData = ref(exampleData)
const inputShapes = ref(exampleShapes)
const inputDataError = ref('')
const inputShapesError = ref('')
const data = ref('')
const shapes = ref('')
const report = ref('')
const focusNode = ref(namedNode('https://linked.data.gov.au/def/record-access/closed'))
const nodeShape = ref(namedNode('https://linked.data.gov.au/def/vocpub/validator/Shui-Concept'))

const {
  resetDataGraph,
  resetShapesGraph,
  dataGraphPointer,
  validator,
  dataGraph,
  shapesGraphPointer,
} = provideResourceManager()

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

  const prefixes = new PrefixMapFactory().prefixMap([
    ['sh', namedNode('http://www.w3.org/ns/shacl#')],
  ])
  const serializer = new Serializer({ prefixes })
  const resultString = serializer.transform(Array.from(result.dataset))
  report.value = resultString
}

watch(dataGraphPointer, () => {
  const serializer = new Serializer()
  inputData.value = serializer.transform(Array.from(dataGraph.value))
  validateData()
})

onMounted(() => {
  validateData()
  setDataGraph()
  setShapesGraph()
})

const nodeShapes = computed(() => {
  return shapesGraphPointer.value.has(rdf.type, sh.NodeShape).terms
})

const focusNodes = computed(() => {
  return Array.from(dataGraph.value.match(null, null, null)).map((quad) => quad.subject)
})
</script>

<template>
  <div class="flex flex-row gap-4">
    <!-- left side -->
    <div class="w-1/2 space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-bold">Validation Report</h2>
        <pre class="max-h-[33vh] overflow-y-auto text-sm">{{ report }}</pre>
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-bold">Data Graph</h2>
        <Textarea
          v-model="inputData"
          @blur="handleDataBlur"
          class="h-[33vh]"
          :class="inputDataError ? 'border-red-600 focus-visible:ring-red-300' : ''"
        />
        <div v-if="inputDataError" class="text-sm text-red-600">{{ inputDataError }}</div>
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-bold">Shapes Graph</h2>
        <Textarea
          v-model="inputShapes"
          @blur="handleShapesBlur"
          class="h-[33vh]"
          :class="inputShapesError ? 'border-red-600 focus-visible:ring-red-300' : ''"
        />
        <div v-if="inputShapesError" class="text-sm text-red-600">{{ inputShapesError }}</div>
      </div>
    </div>

    <!-- right side -->
    <div class="w-1/2 flex flex-row h-[calc(100vh-2rem)]">
      <div class="overflow-y-auto w-full">
        <ResourceShell :focus-node="focusNode" :node-shape="nodeShape" />
      </div>
    </div>
  </div>
</template>
