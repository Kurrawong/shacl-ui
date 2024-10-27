<script setup lang="ts">
import { type NamedNode, DataFactory } from 'n3'
import { ref, onMounted, watch } from 'vue'
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
import { shapeToSparql, sparqlAutoCompleteRewrite } from '@/core/sparql'
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
const suggestions = ref([])

const $rdf = new Environment([NamespaceFactory, DatasetFactory, RDFJSDataFactory, ClownfaceFactory])

onMounted(async () => {
  const nodes = (() => {
    const _nodes = []
    for (const cc of props.constraintComponents) {
      if (cc instanceof NodeConstraintComponent) {
        _nodes.push(...cc.nodes)
      }
    }
    return _nodes
  })()

  const classes = (() => {
    const _classes = []
    for (const cc of props.constraintComponents) {
      if (cc instanceof ClassConstraintComponent) {
        _classes.push(...cc.classes)
      }
    }
    return _classes
  })()

  const targetGraphs = (() => {
    const _targetGraphs = []
    for (const cc of props.constraintComponents) {
      if (cc instanceof TargetGraphConstraintComponent) {
        _targetGraphs.push(...cc.targetGraphs)
      }
    }
    return _targetGraphs
  })()

  const targetGraph = targetGraphs.length ? targetGraphs[0] : props.dataGraph

  if (nodes.length) {
    for (const node of nodes) {
      const ptr: GraphPointer = $rdf.clownface({ dataset: shui.value.store, term: node })
      const labelProperty = ptr
        .out(sh.property)
        .filter((p) => {
          return p.out(dash.propertyRole).term?.equals(dash.LabelRole)
        })
        .out(sh.path)

      const query = shapeToSparql(node, shui.value.store, classes, shui.value.shaclGraphName)
      // TODO: add the user's search query to the sparql query in the rewrite function
      //       the resulting sparql query should include a regex match on string start
      //       and string include for the user's search query
      const modifiedQuery = sparqlAutoCompleteRewrite(query, targetGraph)

      const results = await getSuggestions(modifiedQuery)
      // TODO: load the data from the server response into a store and get the IRI and label using the labelProperty
      console.log(labelProperty)
    }
  } else if (classes.length) {
    for (const cls of classes) {
      // TODO
    }
  }

  // const results = await getSuggestions()
  // suggestions.value = results
})
</script>

<template>
  <AutoComplete v-model="value" :suggestions="suggestions" />
</template>
