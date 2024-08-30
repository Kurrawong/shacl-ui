<script setup lang="ts">
import InputText from 'primevue/inputtext'
import { ref, toRef, watch } from 'vue'
import { DataFactory, type Literal } from 'n3'
import literal = DataFactory.literal

interface Props {
  term: Literal
}

const emit = defineEmits(['update'])
const props = defineProps<Props>()
const term = toRef(props, 'term')
const value = ref(term.value.value)
const datatype = ref(term.value.datatype)
const language = ref(term.value.language)

function emitUpdate() {
  if (language.value) {
    emit('update', literal(value.value, language.value))
  } else {
    emit('update', literal(value.value, datatype.value))
  }
}

watch([value, datatype, language], () => emitUpdate())
</script>

<template>
  <div class="flex">
    <InputText v-model="value" class="grow" />
  </div>
</template>
