<script setup lang="ts">
import InputText from 'primevue/inputtext'
import { type BlankNode, DataFactory } from 'n3'
import { ref, toRef, watch } from 'vue'
import blankNode = DataFactory.blankNode

interface Props {
  term: BlankNode
}

const emit = defineEmits(['update'])
const props = defineProps<Props>()
const term = toRef(props, 'term')
const value = ref(term.value.value)

function emitUpdate() {
  emit('update', blankNode(value.value))
}

watch(value, () => emitUpdate())

// TODO: Add IRI validation.
</script>

<template>
  <InputText v-model="value" class="w-full" />
  <small>Blank Node</small>
</template>
