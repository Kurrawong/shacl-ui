<script setup lang="ts">
import { defineModel, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import InputText from 'primevue/inputtext'
import type { SNamedNode } from '@/shui'
import n3 from 'n3'
import {useShui} from "@/composables/shui";

const { namedNode } = n3.DataFactory

const model = defineModel<SNamedNode>({ required: true })
const { shui } = useShui()
const value = ref(model.value.value)
const id = `a${uuidv4()}`

const handleUpdate = () => {
  // TODO: Retrieve the new label for the new IRI from source (in remote database) and add it to the labels graph.
  model.value = shui.value.toSNamedNode(namedNode(value.value))
}
</script>

<template>
  <label :for="id" class="text-base">{{ model.label }}</label>
  <InputText :id="id" v-model="value" class="w-full" @update:model-value="handleUpdate" />
</template>
