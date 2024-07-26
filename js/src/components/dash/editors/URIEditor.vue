<script setup lang="ts">
import InputText from 'primevue/inputtext'
import { DataFactory, type NamedNode } from 'n3'
import { ref, toRef, watch } from 'vue'
import namedNode = DataFactory.namedNode

interface Props {
  term: NamedNode
}

const emit = defineEmits(['update'])
const props = defineProps<Props>()
const term = toRef(props, 'term')
const value = ref(term.value.value)

function emitUpdate() {
  emit('update', namedNode(value.value))
}

watch(value, () => emitUpdate())

// TODO: Add IRI validation.
</script>

<template>
  <InputText v-model="value" class="w-full" />
  <small>IRI</small>
</template>
