<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import type { Literal } from '@rdfjs/types'
import n3 from 'n3'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { xsd } from '@/core/namespaces'

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
  emit('update', literal(value.value, language.value || xsd.string))
}

function handleBlur() {
  if (value.value !== '' && language.value !== '') {
    emit('blur')
  }
}

watch([value, datatype, language], () => emitUpdate())
</script>

<template>
  <div class="flex gap-2 items-center grow">
    <Textarea v-model="value" @blur="handleBlur" class="resize-y min-h-[160px]" />
    <Input type="text" placeholder="lang" v-model="language" @blur="handleBlur" class="w-18" />
  </div>
</template>
