<script setup lang="ts">
import { ref, toRef, watch, defineEmits } from 'vue'
import { DataFactory } from 'n3'
import Dropdown from 'primevue/dropdown'
import type { Literal } from 'n3'

const { namedNode, literal } = DataFactory
const XSD_boolean = namedNode('http://www.w3.org/2001/XMLSchema#boolean')

function lexicalToValue(value: string) {
  if (value === 'true' || value === '1') {
    return {
      name: 'true',
      code: 'true'
    }
  } else if (value === 'false' || value === '0') {
    return {
      name: 'false',
      code: 'false'
    }
  }

  return null
}

interface Props {
  term: Literal
}

const props = defineProps<Props>()
const emit = defineEmits(['update'])
const term = toRef(props, 'term')
const datatype = ref(term.value.datatype)
const errors = ref<string[]>([])
const selectedValue = ref(lexicalToValue(term.value.value))
const dropdownOptions = ref([
  {
    name: 'true',
    code: 'true'
  },
  {
    name: 'false',
    code: 'false'
  }
])

// TODO: check whether this can be reused when we
//       have the ability to switch widgets in the UI.
// watch(
//   [selectedValue, datatype],
//   () => {
//     emit('change')
//     errors.value = []
//     const value = lexicalToValue(selectedValue.value?.code || '')
//     if (value === null) {
//       errors.value.push(`Invalid lexical boolean value: ${term.value.value}`)
//     }
//
//     if (!datatype.value.equals(XSD_boolean)) {
//       errors.value.push(`Invalid literal datatype value: ${datatype.value.id}`)
//     }
//   },
//   { immediate: true }
// )

const applyDatatypeFix = () => {
  datatype.value = XSD_boolean
}

function emitUpdate() {
  if (selectedValue.value != null) {
    emit('update', literal(selectedValue.value.code, datatype.value))
  }
}

watch([selectedValue, datatype], () => emitUpdate())
</script>

<template>
  <Dropdown v-model="selectedValue" :options="dropdownOptions" option-label="name" />
  <template v-for="error in errors" :key="error">
    <small class="block text-red-500">
      {{ error }}
      <button
        v-if="error.includes('Invalid literal datatype value:')"
        class="text-blue-500 underline"
        @click="applyDatatypeFix"
      >
        Apply fix
      </button>
    </small>
  </template>
</template>
