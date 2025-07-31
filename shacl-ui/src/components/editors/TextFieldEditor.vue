<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import type { Literal } from '@rdfjs/types'
import n3 from 'n3'
import { Input } from '@/components/ui/input'

const { literal } = n3.DataFactory

interface Props {
  term: Literal
}
const emit = defineEmits(['update', 'blur'])
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

function handleBlur() {
  if (value.value !== '') {
    emit('blur')
  }
}

watch([value, datatype, language], () => emitUpdate())
</script>

<template>
  <Input type="text" v-model="value" @blur="handleBlur" />
</template>
