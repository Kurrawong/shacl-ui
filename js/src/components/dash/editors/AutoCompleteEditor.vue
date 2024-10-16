<script setup lang="ts">
import AutoComplete, { type AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import { DataFactory, type NamedNode } from 'n3'
import { ref, toRef, watch, onMounted } from 'vue'
import namedNode = DataFactory.namedNode
import { useShui } from '@/composables/shui'
import { ConstraintComponent } from '@/core/constraint-components/constraint-component'

interface Props {
  term: NamedNode
  constraintComponents: ConstraintComponent[]
  dataGraph: NamedNode
}

type Suggestion = { label: string; code: string }

const emit = defineEmits(['update'])
const props = defineProps<Props>()
const term = toRef(props, 'term')
const value = ref(term.value)
const { shui } = useShui()
const isLoading = ref(true)
const initialSuggestions = ref<Suggestion[]>([])
const suggestions = ref<Suggestion[]>([])

onMounted(async () => {
  const results = await shui.value.getAutoCompleteEditorValues(
    props.constraintComponents,
    props.dataGraph
  )
  initialSuggestions.value = results
    .map((r) => shui.value.toSNamedNode(r.subject as NamedNode))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((s) => ({ label: s.label, code: s.value }))
  suggestions.value = initialSuggestions.value
  isLoading.value = false
})

const inputValue = ref(
  (() => {
    const sTerm = shui.value.toSNamedNode(value.value)
    return sTerm.label
  })()
)
watch(inputValue, (newValue) => {
  if (newValue) {
    handleComplete(newValue.label || '')
  }
})

function emitUpdate() {
  emit('update', value.value)
}

watch(value, () => emitUpdate())

function handleComplete(query: string) {
  const q = query.toLowerCase()
  const suggestionSet = new Set(
    initialSuggestions.value
      .filter((s) => s.label.toLowerCase().startsWith(q))
      .concat(initialSuggestions.value.filter((s) => s.label.toLowerCase().includes(q)))
  )
  suggestions.value = Array.from(suggestionSet)
}

function handleUpdate(newValue: Suggestion) {
  if (newValue && newValue.code) {
    value.value = namedNode(newValue.code)
    inputValue.value = newValue.label
  }
}

function handleBlur() {
  const sTerm = shui.value.toSNamedNode(value.value)
  inputValue.value = sTerm.label
}
</script>

<template>
  <AutoComplete
    v-model="inputValue"
    :suggestions="suggestions"
    option-label="label"
    :loading="isLoading"
    @update:model-value="handleUpdate"
    @blur="handleBlur"
    @complete="(event: AutoCompleteCompleteEvent) => handleComplete(event.query)"
    dropdown
  />
</template>
