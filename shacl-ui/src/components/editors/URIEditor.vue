<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import type { NamedNode } from '@rdfjs/types'
import n3 from 'n3'
import { Input } from '@/components/ui/input'

const { namedNode } = n3.DataFactory

interface Props {
  term: NamedNode
}
const emit = defineEmits(['update', 'blur'])
const props = defineProps<Props>()
const term = toRef(props, 'term')
const value = ref(term.value.value)

function emitUpdate() {
  emit('update', namedNode(value.value))
}

function handleBlur() {
  emit('blur')
}

watch([value], () => emitUpdate())
</script>

<template>
  <Input type="text" v-model="value" @blur="handleBlur" />
</template>
