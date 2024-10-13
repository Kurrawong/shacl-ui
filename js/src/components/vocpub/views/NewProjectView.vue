<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVocPubMachine } from '@/components/vocpub/composables/vocpub-machine'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const { send } = useVocPubMachine()

const conceptSchemeIRI = ref('')

const isValidIRI = (iri: string) => {
  const iriRegex = /^(http|https):\/\/[^ "]+$/
  return iriRegex.test(iri)
}

const isFormValid = computed(() => {
  return isValidIRI(conceptSchemeIRI.value)
})

const handleSubmit = () => {
  if (isFormValid.value) {
    send({
      type: 'editor.project.new.submit',
      conceptSchemeIRI: conceptSchemeIRI.value
    })
  }
}

const handleCancel = () => {
  send({ type: 'editor.project.new.cancel' })
}
</script>

<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">New Project</h2>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col">
        <label for="conceptSchemeIRI" class="mb-2">Concept Scheme IRI</label>
        <small class="text-sm text-gray-500 mb-2">The vocabulary IRI.</small>
        <InputText id="conceptSchemeIRI" v-model="conceptSchemeIRI" type="text" class="w-full" />
        <small
          class="p-error text-red-500"
          v-if="conceptSchemeIRI && !isValidIRI(conceptSchemeIRI)"
        >
          Please enter a valid IRI (e.g., http://example.com/scheme)
        </small>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Cancel" @click="handleCancel" class="p-button-secondary" />
        <Button
          label="Next"
          @click="handleSubmit"
          class="p-button-primary"
          :disabled="!isFormValid"
        />
      </div>
    </div>
  </div>
</template>
