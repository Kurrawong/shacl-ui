<script setup lang="ts">
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { Codemirror } from 'vue-codemirror'
import { onMounted, ref, watch } from 'vue'
import { DataFactory, Parser } from 'n3'
import quad = DataFactory.quad
import namedNode = DataFactory.namedNode
import RDFTextareaError from '@/components/playground/RDFTextareaError.vue'
import { useShui } from '@/composables/shui'

interface Props {
  label: string
  graph: string
}

const model = defineModel({ required: true, type: String })
const updated = defineModel('updated', { required: true, type: Boolean })
const props = defineProps<Props>()
const { graph } = props
const { shui, addQuads, reset } = useShui()
const toast = useToast()
const error = ref('')
const graphTerm = namedNode(graph)

onMounted(() => {
  reset()
})

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

function handleSave() {
  updated.value = false
  try {
    const parser = new Parser()
    const quads = parser
      .parse(model.value)
      .map((q) => quad(q.subject, q.predicate, q.object, graphTerm))

    const existingQuads = shui.value.store
      .getQuads(null, null, null, null)
      .filter((q) => !q.graph.equals(graphTerm))
    reset()
    const totalQuads = quads.concat(existingQuads)
    addQuads(totalQuads)

    toast.add({
      severity: 'success',
      summary: 'Saved',
      detail: `Successfully loaded ${quads.length} statements`,
      life: 3000
    })
  } catch (err) {
    error.value = getErrorMessage(err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred', life: 3000 })
  }
}

watch(model, () => {
  error.value = ''
})
</script>

<template>
  <Toast />
  <div>
    <div class="flex content-center">
      <h2 class="text-lg font-semibold">{{ label }}</h2>
      <div class="grow"></div>

      <Button style="height: 28px" class="mb-3 invisible" />
      <RDFTextareaError :error="error" />
      <Button
        icon="pi pi-save"
        label="save"
        style="height: 28px"
        class="mb-3"
        :class="updated ? '' : 'hidden'"
        @click="handleSave"
      />
    </div>

    <Codemirror
      v-model="model"
      :style="{ height: '39vh', maxWidth: '50vw' }"
      @change="updated = true"
    />
  </div>
</template>
