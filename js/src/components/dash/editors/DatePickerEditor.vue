<script setup lang="ts">
import Calendar from 'primevue/calendar'
import { ref, toRef, watch } from 'vue'
import { DataFactory, type Literal } from 'n3'
import literal = DataFactory.literal

interface Props {
  term: Literal
}

const emit = defineEmits(['update'])
const props = defineProps<Props>()
const term = toRef(props, 'term')
const value = ref(new Date(term.value.value))
const datatype = ref(term.value.datatype)
const language = ref(term.value.language)

function emitUpdate() {
  emit(
    'update',
    literal(
      `${value.value.getFullYear()}-${value.value.getMonth()}-${value.value.getDate()}`,
      datatype.value
    )
  )
}

watch([value, datatype, language], () => emitUpdate())
</script>

<template>
  <div class="flex">
    <Calendar v-model="value" date-format="yy-mm-dd" />
  </div>
</template>
