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
const langError = ref(false)

function emitUpdate() {
  if (language.value) {
    langError.value = false
    emit('update', literal(value.value, language.value))
  } else {
    langError.value = true
  }
}

function handleBlur() {
  emit('blur')
}

watch([value, datatype, language], () => emitUpdate())
</script>

<template>
  <div class="flex gap-2 items-center">
    <Input type="text" v-model="value" @blur="handleBlur" />
    <Input
      type="text"
      placeholder="lang"
      v-model="language"
      @blur="handleBlur"
      class="w-18"
      :class="{ 'border-destructive': langError }"
    />
  </div>
</template>
