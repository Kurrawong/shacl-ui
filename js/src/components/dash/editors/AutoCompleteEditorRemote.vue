<script setup lang="ts">
import { type NamedNode, DataFactory, Parser, Store } from 'n3'
import { ref, onMounted, computed, watch } from 'vue'
import { DatasetFactory, Environment, NamespaceFactory } from 'rdf-ext'
import RDFJSDataFactory from '@rdfjs/data-model/Factory'
import ClownfaceFactory from 'clownface/Factory'
import type { GraphPointer } from 'clownface'
import namedNode = DataFactory.namedNode
import AutoComplete, { type AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import { useShui } from '@/composables/shui'
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { useAutocomplete } from '@/composables/autocomplete'
import { NodeConstraintComponent } from '@/core/constraint-components/shape-based/node'
import { ClassConstraintComponent } from '@/core/constraint-components/value-type/class'
import { shapeToSparql, rewriteSparqlAutoComplete } from '@/core/sparql'
import { TargetGraphConstraintComponent } from '@/core/constraint-components/target-graph'
import { dash, sh } from '@/core/namespaces'

type Suggestion = { label: string; code: string }

interface Props {
  term: NamedNode
  constraintComponents: ConstraintComponent[]
  dataGraph: NamedNode
}

const props = defineProps<Props>()
const emit = defineEmits(['update'])
const { shui, serverUrl } = useShui()
const { getSuggestions, isLoading, isError, errorMessage } = useAutocomplete(
  props.constraintComponents,
  props.dataGraph
)
const value = ref(props.term)
const inputValue = ref(
  (() => {
    const sTerm = shui.value.toSNamedNode(value.value)
    return sTerm.label
  })()
)
const suggestions = ref<Suggestion[]>([])

const $rdf = new Environment([NamespaceFactory, DatasetFactory, RDFJSDataFactory, ClownfaceFactory])

const nodes = computed(() => {
  const _nodes = []
  for (const cc of props.constraintComponents) {
    if (cc instanceof NodeConstraintComponent) {
      _nodes.push(...cc.nodes)
    }
  }
  return _nodes
})

const classes = computed(() => {
  const _classes = []
  for (const cc of props.constraintComponents) {
    if (cc instanceof ClassConstraintComponent) {
      _classes.push(...cc.classes)
    }
  }
  return _classes
})

const targetGraphs = () => {
  const _targetGraphs = []
  for (const cc of props.constraintComponents) {
    if (cc instanceof TargetGraphConstraintComponent) {
      _targetGraphs.push(...cc.targetGraphs)
    }
  }
  return _targetGraphs
}

const targetGraph = computed(() => {
  return targetGraphs().length ? targetGraphs()[0] : props.dataGraph
})

onMounted(async () => {
  search('')
})

async function search(searchQuery: string) {
  const parser = new Parser()

  if (nodes.value.length) {
    for (const node of nodes.value) {
      const ptr: GraphPointer = $rdf.clownface({ dataset: shui.value.store, term: node })
      const labelProperty = ptr
        .out(sh.property)
        .filter((p) => {
          return p.out(dash.propertyRole).term?.equals(dash.LabelRole)
        })
        .out(sh.path)

      const query = shapeToSparql(node, shui.value.store, classes.value, shui.value.shaclGraphName)
      // TODO: add the user's search query to the sparql query in the rewrite function
      //       the resulting sparql query should include a regex match on string start
      //       and string include for the user's search query
      const modifiedQuery = rewriteSparqlAutoComplete(
        query,
        namedNode(labelProperty.value),
        targetGraph.value,
        searchQuery
      )

      const results = await getSuggestions(modifiedQuery)
      // TODO: load the data from the server response into a store and get the IRI and label using the labelProperty
      const store = new Store()
      const quads = parser.parse(results as string)
      for (const quad of quads) {
        store.addQuad(quad)
      }

      suggestions.value = store
        .getQuads(null, labelProperty.value, null, null)
        .map((quad) => ({ label: quad.object.value, code: quad.subject.value }))
        .sort((a, b) => a.label.localeCompare(b.label))
    }
  } else if (classes.value.length) {
    // TODO: this pulls everything without pagination or search. We may need to think of a better way to handle this.
    //       Alternatively, users can specify an sh:node value to limit the results. This also allows users to specify
    //       the label predicate for searching.
    for (const cls of classes.value) {
      const query = `\
        PREFIX sdo: <https://schema.org/>
        CONSTRUCT
        FROM <${targetGraph.value.value}>
        WHERE {
          ?s a <${cls.value}> ;
            sdo:name ?label .
        }
      `
      const results = await getSuggestions(query)
      const store = new Store()
      const quads = parser.parse(results as string)
      for (const quad of quads) {
        store.addQuad(quad)
      }

      // TODO: get the label property from the constraint components
      console.log(props.constraintComponents)
      suggestions.value = store
        .getQuads(null, namedNode('https://schema.org/name'), null, null)
        .map((quad) => ({ label: quad.object.value, code: quad.subject.value }))
        .sort((a, b) => a.label.localeCompare(b.label))
    }
  }

  // const results = await getSuggestions()
  // suggestions.value = results
}

function handleUpdate(newValue: Suggestion | null) {
  if (newValue !== null) {
    if (typeof newValue === 'string') {
      inputValue.value = newValue
    } else if (newValue.code) {
      inputValue.value = newValue.label
      value.value = namedNode(newValue.code)
    }
  } else {
    inputValue.value = shui.value.toSNamedNode(value.value).label
  }
}

function emitUpdate() {
  emit('update', value.value)
}
watch(value, () => emitUpdate())
</script>

<template>
  <AutoComplete
    v-model="inputValue"
    @update:model-value="handleUpdate"
    :suggestions="suggestions"
    option-label="label"
    dropdown
    force-selection
    @complete="async (event: AutoCompleteCompleteEvent) => search(event.query)"
  />
</template>
