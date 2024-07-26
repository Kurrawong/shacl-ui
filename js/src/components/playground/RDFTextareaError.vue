<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { ref } from 'vue'

interface Props {
  error: string
}
defineProps<Props>()
const visible = ref(false)
</script>

<template>
  <Button
    icon="pi pi-exclamation-circle"
    severity="danger"
    style="height: 28px"
    class="mb-3"
    :class="error ? '' : 'hidden'"
    @click="visible = true"
    outlined
  />
  <Dialog
    v-model:visible="visible"
    modal
    header="Error"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <pre>{{ error }}</pre>
  </Dialog>
</template>
