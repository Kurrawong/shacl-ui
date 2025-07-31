<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import type { Literal } from '@rdfjs/types'
import n3 from 'n3'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { xsd } from '@/core/namespaces'

const { literal } = n3.DataFactory

interface Props {
  term: Literal
}
const emit = defineEmits(['update', 'blur'])
const props = defineProps<Props>()
const term = toRef(props, 'term')
const value = ref(term.value.value)

function emitUpdate() {
  if (value.value !== '') {
    emit('update', literal(value.value, xsd.boolean))
    emit('blur')
  }
}

watch([value], () => emitUpdate())
</script>

<template>
  <Select v-model="value">
    <SelectTrigger class="w-[180px]">
      <SelectValue placeholder="Select a value" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="true"> true </SelectItem>
        <SelectItem value="false"> false </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
