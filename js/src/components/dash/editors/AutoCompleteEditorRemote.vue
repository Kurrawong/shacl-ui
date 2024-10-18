<script setup lang="ts">
import { type NamedNode, DataFactory } from 'n3'
import { ref, onMounted, watch } from 'vue'
import namedNode = DataFactory.namedNode
import AutoComplete, { type AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import { useShui } from '@/composables/shui'
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'
import { useAutocomplete } from '@/composables/autocomplete'
import { NodeConstraintComponent } from '@/core/constraint-components/shape-based/node'
import { ClassConstraintComponent } from '@/core/constraint-components/value-type/class'
import { shapeToSparql, sparqlAutoCompleteRewrite } from '@/core/sparql'

type Suggestion = { label: string; code: string }

interface Props {
  term: NamedNode
  constraintComponents: ConstraintComponent[]
  dataGraph: NamedNode
}

const props = defineProps<Props>()
const emit = defineEmits(['update'])
const { shui, serverUrl } = useShui()
const { getSuggestions, isLoading, isError, errorMessage } = useAutocomplete()
const value = ref(props.term)
const inputValue = ref(
  (() => {
    const sTerm = shui.value.toSNamedNode(value.value)
    return sTerm.label
  })()
)
const suggestions = ref([])

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

  // TODO: get targetGraph constraint component

  if (nodes.length) {
    for (const node of nodes) {
      // TODO: use targetGraph instead of shaclGraph here
      const query = shapeToSparql(node, shui.value.store, shui.value.shaclGraphName)
      // TODO: add the user's search query to the sparql query in the rewrite function
      //       the resulting sparql query should include a regex match on string start
      //       and string include for the user's search query
      const modifiedQuery = sparqlAutoCompleteRewrite(query, classes, props.dataGraph)
      console.log(modifiedQuery)
      // TODO
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
