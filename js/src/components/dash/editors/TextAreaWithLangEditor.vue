<script setup lang="ts">
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
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
const language = ref(
  term.value.language ? { name: term.value.language, code: term.value.language } : null
)
const languageOptions = ref([
  {
    name: 'en',
    code: 'en'
  },
  {
    name: 'fr',
    code: 'fr'
  }
])

function emitUpdate() {
  if (language.value) {
    emit('update', literal(value.value, language.value.code))
  } else {
    emit('update', literal(value.value, datatype.value))
  }
}

watch([value, datatype, language], () => emitUpdate())
</script>

<template>
  <div class="flex">
    <Textarea v-model="value" class="grow" autoResize />
    <div>
      <Dropdown v-model="language" :options="languageOptions" option-label="name" />
    </div>
  </div>
</template>
