<script setup lang="ts">
import { type NamedNode, DataFactory } from 'n3'
import { ref, onMounted, watch } from 'vue'
import namedNode = DataFactory.namedNode
import AutoComplete, { type AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import { useShui } from '@/composables/shui'
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'

type Suggestion = { label: string; code: string }

interface Props {
  term: NamedNode
  constraintComponents: ConstraintComponent[]
  dataGraph: NamedNode
}

const props = defineProps<Props>()
const emit = defineEmits(['update'])
const { shui } = useShui()
const suggestions = ref()
const filteredSuggestions = ref()
const value = ref(props.term)
const inputValue = ref(
  (() => {
    const sTerm = shui.value.toSNamedNode(value.value)
    return sTerm.label
  })()
)
const isLoading = ref(true)

onMounted(async () => {
  const results = await shui.value.getAutoCompleteEditorValues(
    props.constraintComponents,
    props.dataGraph
  )
  suggestions.value = results
    .map((r) => shui.value.toSNamedNode(r.subject as NamedNode))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((s) => ({ label: s.label, code: s.value }))
  filteredSuggestions.value = suggestions.value
  isLoading.value = false
})

function search(event: AutoCompleteCompleteEvent) {
  const query = event.query
  console.log(query)
  const suggestionSet = new Set(
    suggestions.value
      .filter((s) => s.label.toLowerCase().startsWith(query.toLowerCase()))
      .concat(suggestions.value.filter((s) => s.label.toLowerCase().includes(query.toLowerCase())))
  )
  filteredSuggestions.value = Array.from(suggestionSet)
}

function handleUpdate(newValue: string | Suggestion) {
  if (typeof newValue === 'string') {
    inputValue.value = newValue
  } else if (newValue.code) {
    inputValue.value = newValue.label
    value.value = namedNode(newValue.code)
  }
}

function handleBlur() {
  inputValue.value = shui.value.toSNamedNode(value.value).label
}

function emitUpdate() {
  emit('update', value.value)
}
watch(value, () => emitUpdate())
</script>

<template>
  <AutoComplete
    :model-value="inputValue"
    @update:model-value="handleUpdate"
    :suggestions="filteredSuggestions"
    :loading="isLoading"
    option-label="label"
    dropdown
    @complete="search"
    @blur="handleBlur"
    :pt="{
      input: {
        style: 'width: 600px'
      }
    }"
  />
</template>
