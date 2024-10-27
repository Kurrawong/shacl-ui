<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useVocPubMachine } from '@/components/vocpub/composables/vocpub-machine'

const { snapshot, send } = useVocPubMachine()

const showDialog = ref(false)
const newConceptLocalName = ref('')

const conceptSchemeIRI = computed(() => snapshot.value.context.conceptSchemeIRI)

const handleCreateConcept = () => {
  const newConceptIRI = `${conceptSchemeIRI.value}/${newConceptLocalName.value}`
  send({ type: 'new.concept.dialog.create', conceptIRI: newConceptIRI })
  showDialog.value = false
  newConceptLocalName.value = ''
}

const handleCancelCreateConcept = () => {
  send({ type: 'new.concept.dialog.cancel' })
  showDialog.value = false
  newConceptLocalName.value = ''
}

watch(
  () => snapshot.value.matches('creatingConcept'),
  (isCreatingConcept) => {
    showDialog.value = isCreatingConcept
    if (isCreatingConcept) {
      newConceptLocalName.value = ''
    }
  }
)
</script>

<template>
  <Dialog
    v-model:visible="showDialog"
    modal
    header="Create New Concept"
    @hide="handleCancelCreateConcept"
    :style="{ width: '50vw' }"
  >
    <div class="space-y-4">
      <div>
        <label for="localName" class="block">Local Name</label>
        <InputText id="localName" v-model="newConceptLocalName" autofocus />
      </div>
      <div>
        <label>New Concept IRI</label>
        <div>
          <code>{{ conceptSchemeIRI }}/</code>
          <InputText :model-value="newConceptLocalName" readonly disabled />
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        @click="handleCancelCreateConcept"
        outlined
        severity="secondary"
      />
      <Button label="Create" icon="pi pi-check" @click="handleCreateConcept" autofocus />
    </template>
  </Dialog>
</template>
