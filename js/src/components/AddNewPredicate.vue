<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import BlockUI from 'primevue/blockui'
import type { PredicateConstraints } from '@/types'
import { toRef, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { DataFactory } from 'n3'
import namedNode = DataFactory.namedNode
import { DEFAULT_SH_ORDER_VALUE } from '@/core/constraint-components/constraint-component'

interface Props {
  predicateObjectValues: PredicateConstraints[]
}
const props = defineProps<Props>()
const predicateObjectValues = toRef(props, 'predicateObjectValues')
const dialogIsVisible = ref(false)
const prediateInputId = ref(`a${uuidv4()}`)
const predicateInputValue = ref('')

function handleAddNewPredicateButtonClick() {
  console.log(predicateObjectValues.value)
  dialogIsVisible.value = true
}

function handleDialogAddPredicateButtonClick() {
  const predicate = namedNode(predicateInputValue.value)
  const newPredicateObjectValues = {
    order: DEFAULT_SH_ORDER_VALUE,
    constraintComponents: [],
    group: null,
    term: predicate,
    values: []
  }
  predicateObjectValues.value.push(newPredicateObjectValues)

  // Reset
  predicateInputValue.value = ''
  dialogIsVisible.value = false
}
</script>

<template>
  <BlockUI :blocked="dialogIsVisible" full-screen />
  <Button
    label="Add new predicate"
    severity="secondary"
    @click="handleAddNewPredicateButtonClick"
  />
  <Dialog v-model:visible="dialogIsVisible" :style="{ width: '30rem' }">
    <div class="">
      <span class="p-text-secondary block mb-5 font-bold">Add a new predicate</span>
      <hr class="pb-4" />

      <div class="space-y-4">
        <label :for="prediateInputId" class="font-semibold w-6rem block">Predicate IRI</label>
        <InputText
          v-model="predicateInputValue"
          :id="prediateInputId"
          class="flex-auto w-full"
          autocomplete="off"
        />

        <div class="flex justify-content-end gap-2">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            @click="dialogIsVisible = false"
          ></Button>
          <Button type="button" label="Add" @click="handleDialogAddPredicateButtonClick"></Button>
        </div>
      </div>
    </div>
  </Dialog>
</template>
