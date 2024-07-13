<script setup lang="ts">
import { defineModel, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import InputText from 'primevue/inputtext'
import type { SLiteral, SNamedNode } from '@/shui'
import n3 from 'n3'
import { useShui } from '@/composables/shui'

const { namedNode, literal } = n3.DataFactory

const model = defineModel<SLiteral>({ required: true })
const { shui } = useShui()
const value = ref(model.value.value)
const datatype = ref(model.value.datatype?.value)
const language = ref(model.value.language)
const id = `a${uuidv4()}`

const handleUpdate = () => {
  if (language.value) {
    model.value = shui.value.toSLiteral(literal(value.value, language.value))
  } else if (datatype.value) {
    model.value = shui.value.toSLiteral(literal(value.value, namedNode(datatype.value)))
  } else {
    model.value = shui.value.toSLiteral(literal(value.value))
  }
}
</script>

<template>
  <label :for="id" class="text-base">Value</label>
  <InputText :id="id" v-model="value" class="w-full" @update:model-value="handleUpdate" />

  <label :for="`datatype-${id}`" class="text-base">Datatype</label>
  <InputText
    :id="`datatype-${id}`"
    v-model="datatype"
    class="w-full"
    @update:model-value="handleUpdate"
  />
</template>
