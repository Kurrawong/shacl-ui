<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import type { SIdentifiedNode, STerm } from '@/types'
import type { SNamedNode } from '@/shui'
import IRI from '@/components/IRI.vue'
import { useShui } from '@/composables/shui'
import n3 from 'n3'
import Resource from '@/components/Resource.vue'
import Literal from "@/components/Literal.vue";

const { quad } = n3.DataFactory

interface Props {
  subject: SIdentifiedNode
  predicate: SNamedNode
  object: STerm
  graph: SIdentifiedNode
}
const { subject, predicate, object, graph } = defineProps<Props>()
const { shui, addQuads, removeQuads } = useShui()
const objectValue = ref(shui.value.toSTerm(object))
const updated = ref(false)
watch(objectValue, () => {
  updated.value = true
})

const handleSave = () => {
  removeQuads([quad(subject, predicate, object, graph)])
  addQuads([quad(subject, predicate, objectValue.value, graph)])
  updated.value = false
}

const handleDelete = () => {
  // TODO: If the subject is a blank node, recursively follow any other blank nodes and delete those statements too.
  // We don't want dangling blank nodes in the data.
  removeQuads([quad(subject, predicate, object, graph)])
}
</script>

<template>
  <div class="space-y-2">
    <IRI v-if="objectValue.termType === 'NamedNode'" v-model="objectValue" />
    <Resource
      v-else-if="objectValue.termType === 'BlankNode'"
      :subject="objectValue"
      :graph="graph"
    />
    <Literal v-else v-model="objectValue" />

    <div class="flex flex-row-reverse space-x-2 space-x-reverse">
      <Button v-if="updated" icon="pi pi-check" aria-label="Save" @click="handleSave" />
      <Button
        icon="pi pi-trash"
        aria-label="Submit"
        severity="danger"
        @click="handleDelete"
        outlined
      />
    </div>
  </div>
</template>
